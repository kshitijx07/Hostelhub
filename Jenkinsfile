@Library('hostelhub-lib@main') _

pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }

    tools {
        nodejs 'node18'   // MUST exist in Jenkins UI
    }

    environment {
        SKIP_PIPELINE = 'false'
        DOCKER_USER   = 'kshitij2511'
    }

    stages {

        /* ===================== CHECKOUT ===================== */

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        /* ===================== CI LOOP GUARD ===================== */

        stage('Guard: Prevent CI Loop') {
            steps {
                script {
                    def author  = sh(script: "git log -1 --pretty=%an", returnStdout: true).trim()
                    def message = sh(script: "git log -1 --pretty=%B",  returnStdout: true).trim()

                    echo "Commit author  : ${author}"
                    echo "Commit message : ${message}"

                    if (author == 'jenkins-ci' || message.contains('[skip ci]')) {
                        echo '⏭️ CI self-trigger detected — skipping pipeline'
                        env.SKIP_PIPELINE = 'true'
                        currentBuild.result = 'NOT_BUILT'
                    }
                }
            }
        }

        /* ===================== DOCKER LOGIN ===================== */

        stage('Docker Login') {
            when { expression { env.SKIP_PIPELINE != 'true' } }
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        /* ===================== VERSIONING ===================== */

        stage('Versioning') {
            when { expression { env.SKIP_PIPELINE != 'true' } }
            steps {
                sh '''
                    set -e

                    echo "📦 Backend version bump"
                    cd backend
                    npm version patch --no-git-tag-version
                    node -p "require('./package.json').version" > ../backend.version
                    cd ..

                    echo "📦 Frontend version bump"
                    cd fronted
                    npm version patch --no-git-tag-version
                    node -p "require('./package.json').version" > ../frontend.version
                    cd ..
                '''

                script {
                    env.BACKEND_VERSION  = readFile('backend.version').trim()
                    env.FRONTEND_VERSION = readFile('frontend.version').trim()

                    echo "Backend  Version : v${env.BACKEND_VERSION}"
                    echo "Frontend Version : v${env.FRONTEND_VERSION}"
                }
            }
        }

        /* ===================== COMMIT VERSION ===================== */

        stage('Commit Version Updates') {
            when { expression { env.SKIP_PIPELINE != 'true' } }
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'github-cred',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_PASS'
                    )
                ]) {
                    sh '''
                        set -e

                        git config user.name  "jenkins-ci"
                        git config user.email "jenkins@ci.local"

                        git add backend/package.json backend/package-lock.json
                        git add fronted/package.json fronted/package-lock.json

                        git diff --cached --quiet && exit 0

                        git commit -m "chore(ci): bump versions [skip ci]"
                        git push https://$GIT_USER:$GIT_PASS@github.com/kshitijx07/Hostelhub.git HEAD:main
                    '''
                }
            }
        }

        /* ===================== BUILD & PUSH ===================== */

        stage('Build & Push Backend') {
            when { expression { env.SKIP_PIPELINE != 'true' } }
            steps {
                dockerBuildPush(
                    user: env.DOCKER_USER,
                    image: 'hostelhub-backend',
                    version: "v${env.BACKEND_VERSION}",
                    dir: 'backend'
                )
            }
        }

        stage('Build & Push Frontend') {
            when { expression { env.SKIP_PIPELINE != 'true' } }
            steps {
                dockerBuildPush(
                    user: env.DOCKER_USER,
                    image: 'hostelhub-frontend',
                    version: "v${env.FRONTEND_VERSION}",
                    dir: 'fronted'
                )
            }
        }

        /* ===================== DEPLOY ===================== */

        stage('Deploy to EC2') {
            when { expression { env.SKIP_PIPELINE != 'true' } }
            steps {
                sshagent(['ec2-server-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no ec2-user@13.201.9.186 "
                          set -e

                          echo '🚀 Pulling images'
                          docker pull ${DOCKER_USER}/hostelhub-backend:v${BACKEND_VERSION}
                          docker pull ${DOCKER_USER}/hostelhub-frontend:v${FRONTEND_VERSION}

                          echo '🧹 Removing old containers'
                          docker rm -f hostelhub-backend hostelhub-frontend || true

                          echo '▶ Starting backend'
                          docker run -d --name hostelhub-backend -p 3001:3001 \
                            ${DOCKER_USER}/hostelhub-backend:v${BACKEND_VERSION}

                          echo '▶ Starting frontend'
                          docker run -d --name hostelhub-frontend -p 3000:80 \
                            ${DOCKER_USER}/hostelhub-frontend:v${FRONTEND_VERSION}
                        "
                    '''
                }
            }
        }
    }

    /* ===================== POST ===================== */

    post {
        success {
            echo '✅ CI/CD pipeline completed successfully'
        }
        aborted {
            echo '⏭️ Pipeline skipped (CI loop prevention)'
        }
        failure {
            echo '❌ Pipeline failed'
        }
    }
}
