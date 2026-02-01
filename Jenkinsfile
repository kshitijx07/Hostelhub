@Library('hostelhub-lib') _

pipeline {
    agent any

    environment {
        DOCKERHUB_USER  = 'kshitij2511'
        BACKEND_IMAGE   = 'hostelhub-backend'
        FRONTEND_IMAGE  = 'hostelhub-frontend'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
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
                script {
                    env.BACKEND_VERSION  = bumpNpmVersion(dir: 'backend')
                    env.FRONTEND_VERSION = bumpNpmVersion(dir: 'fronted')

                    echo "Backend Version  : ${env.BACKEND_VERSION}"
                    echo "Frontend Version : ${env.FRONTEND_VERSION}"
                }
            }
        }

        stage('Build & Push Backend') {
            steps {
                dockerBuildPush(
                    user: DOCKERHUB_USER,
                    image: BACKEND_IMAGE,
                    version: env.BACKEND_VERSION,
                    dir: 'backend'
                )
            }
        }

        stage('Build & Push Frontend') {
            steps {
                dockerBuildPush(
                    user: DOCKERHUB_USER,
                    image: FRONTEND_IMAGE,
                    version: env.FRONTEND_VERSION,
                    dir: 'fronted'
                )
            }
        }
    }

    post {
        success {
            echo "✅ Docker images built & pushed with auto versioning"
        }
        failure {
            echo "❌ Pipeline failed"
        }
    }
}
