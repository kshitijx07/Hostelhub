@Library('hostelhub-lib@main') _

pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Guard: Prevent CI Loop') {
            steps {
                script {
                    def author = sh(
                        script: "git log -1 --pretty=%an",
                        returnStdout: true
                    ).trim()

                    def message = sh(
                        script: "git log -1 --pretty=%B",
                        returnStdout: true
                    ).trim()

                    if (author == 'jenkins-ci' || message.contains('[skip ci]')) {
                        currentBuild.result = 'NOT_BUILT'
                        error('CI loop prevention')
                    }
                }
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                }
            }
        }

        stage('Versioning') {
            steps {
                sh '''
                    set -e
                    cd backend
                    npm version patch --no-git-tag-version
                    node -p "require('./package.json').version" > ../backend.version
                    cd ..

                    cd fronted
                    npm version patch --no-git-tag-version
                    node -p "require('./package.json').version" > ../frontend.version
                    cd ..
                '''
                script {
                    env.BACKEND_VERSION  = readFile('backend.version').trim()
                    env.FRONTEND_VERSION = readFile('frontend.version').trim()
                }
            }
        }

        stage('Commit Version Updates') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'github-cred',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_PASS'
                    )
                ]) {
                    sh '''
                        git config user.name "jenkins-ci"
                        git config user.email "jenkins@ci.local"
                        git add backend/package.json backend/package-lock.json
                        git add fronted/package.json fronted/package-lock.json
                        git commit -m "chore(ci): bump versions [skip ci]" || true
                        git push https://$GIT_USER:$GIT_PASS@github.com/kshitijx07/Hostelhub.git HEAD:main
                    '''
                }
            }
        }

        stage('Build & Push Backend') {
            steps {
                dockerBuildPush(
                    user: 'kshitij2511',
                    image: 'hostelhub-backend',
                    version: "v${env.BACKEND_VERSION}",
                    dir: 'backend'
                )
            }
        }

        stage('Build & Push Frontend') {
            steps {
                dockerBuildPush(
                    user: 'kshitij2511',
                    image: 'hostelhub-frontend',
                    version: "v${env.FRONTEND_VERSION}",
                    dir: 'fronted'
                )
            }
        }

        stage('Deploy to EC2') {
            steps {
                script {
                    def backendImage  = "kshitij2511/hostelhub-backend:v${env.BACKEND_VERSION}"
                    def frontendImage = "kshitij2511/hostelhub-frontend:v${env.FRONTEND_VERSION}"

                    sshagent(['ec2-server-key']) {
                        sh """
                        ssh -o StrictHostKeyChecking=no ec2-user@13.201.9.186 << 'EOF'
                          docker pull ${backendImage}
                          docker pull ${frontendImage}

                          docker rm -f hostelhub-backend || true
                          docker rm -f hostelhub-frontend || true

                          docker run -d --name hostelhub-backend -p 3001:3001 ${backendImage}
                          docker run -d --name hostelhub-frontend -p 3000:3000 ${frontendImage}
                        EOF
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully'
        }
        failure {
            echo '❌ Pipeline failed'
        }
    }
}
