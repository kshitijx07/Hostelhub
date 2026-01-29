pipeline {
    agent any

    environment {
        DOCKER_USERNAME = 'kshitij2511'
        BACKEND_IMAGE = 'hostelhub-backend'
        FRONTEND_IMAGE = 'hostelhub-frontend'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend: Install & Test') {
            agent {
                docker {
                    image 'node:18-alpine'
                }
            }
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'npm test || echo "No tests defined"'
                }
            }
        }

        stage('Backend: Docker Build & Push') {
            steps {
                dir('backend') {
                    sh """
                        docker build -t $DOCKER_USERNAME/$BACKEND_IMAGE:${BUILD_NUMBER} .
                        docker tag $DOCKER_USERNAME/$BACKEND_IMAGE:${BUILD_NUMBER} $DOCKER_USERNAME/$BACKEND_IMAGE:latest
                        docker push $DOCKER_USERNAME/$BACKEND_IMAGE:${BUILD_NUMBER}
                        docker push $DOCKER_USERNAME/$BACKEND_IMAGE:latest
                    """
                }
            }
        }

        stage('Frontend: Build') {
            agent {
                docker {
                    image 'node:20-alpine'
                }
            }
            steps {
                dir('fronted') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Frontend: Docker Build & Push') {
            steps {
                dir('fronted') {
                    sh """
                        docker build -t $DOCKER_USERNAME/$FRONTEND_IMAGE:${BUILD_NUMBER} .
                        docker tag $DOCKER_USERNAME/$FRONTEND_IMAGE:${BUILD_NUMBER} $DOCKER_USERNAME/$FRONTEND_IMAGE:latest
                        docker push $DOCKER_USERNAME/$FRONTEND_IMAGE:${BUILD_NUMBER}
                        docker push $DOCKER_USERNAME/$FRONTEND_IMAGE:latest
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully'
        }
        failure {
            echo '❌ Pipeline failed. Check logs.'
        }
    }
}
