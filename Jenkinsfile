@Library('hostelhub-lib@main') _

pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
    }

    tools {
        nodejs 'node18'
    }

    environment {
        DOCKER_USER = 'kshitij2511'
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
                    def msg = sh(
                        script: "git log -1 --pretty=%B",
                        returnStdout: true
                    ).trim()

                    echo "Commit message: ${msg}"

                    if (msg.contains('[skip ci]')) {
                        currentBuild.description = 'Skipped (CI commit)'
                        error('CI self-trigger detected — aborting pipeline')
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
                    cd backend
                    npm version patch --no-git-tag-version
                    node -p "require('./package.json').version" > ../backend.version
                    cd ..

                    cd fronted
                    npm version patch --no-git-tag-version
                    node -p "require('./package.json').version" > ../frontend.version
                    cd ..
                '''
            }
        }

        stage('Build & Push Backend') {
            steps {
                dockerBuildPush(
                    user: env.DOCKER_USER,
                    image: 'hostelhub-backend',
                    version: "v${readFile('backend.version').trim()}",
                    dir: 'backend'
                )
            }
        }

        stage('Build & Push Frontend') {
            steps {
                dockerBuildPush(
                    user: env.DOCKER_USER,
                    image: 'hostelhub-frontend',
                    version: "v${readFile('frontend.version').trim()}",
                    dir: 'fronted'
                )
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(['ec2-server-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no ec2-user@13.201.9.186 "
                        docker pull ${DOCKER_USER}/hostelhub-backend &&
                        docker pull ${DOCKER_USER}/hostelhub-frontend &&
                        docker rm -f hostelhub-backend hostelhub-frontend || true &&
                        docker run -d --name hostelhub-backend -p 3001:3001 ${DOCKER_USER}/hostelhub-backend &&
                        docker run -d --name hostelhub-frontend -p 3000:80 ${DOCKER_USER}/hostelhub-frontend
                        "
                    '''
                }
            }
        }
    }

    post {
        aborted {
            echo '⏭️ Pipeline aborted intentionally (CI loop)'
        }
        success {
            echo '✅ CI/CD completed'
        }
    }
}
