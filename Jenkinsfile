pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'kshitij2511'
        BACKEND_IMAGE  = 'hostelhub-backend'
        FRONTEND_IMAGE = 'hostelhub-frontend'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                      echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Build & Push Backend') {
            steps {
                dir('backend') {
                    sh '''
                      docker build -t $DOCKERHUB_USER/$BACKEND_IMAGE:${BUILD_NUMBER} .
                      docker tag  $DOCKERHUB_USER/$BACKEND_IMAGE:${BUILD_NUMBER} $DOCKERHUB_USER/$BACKEND_IMAGE:latest
                      docker push $DOCKERHUB_USER/$BACKEND_IMAGE:${BUILD_NUMBER}
                      docker push $DOCKERHUB_USER/$BACKEND_IMAGE:latest
                    '''
                }
            }
        }

        stage('Build & Push Frontend') {
            steps {
                dir('fronted') {
                    sh '''
                      docker build -t $DOCKERHUB_USER/$FRONTEND_IMAGE:${BUILD_NUMBER} .
                      docker tag  $DOCKERHUB_USER/$FRONTEND_IMAGE:${BUILD_NUMBER} $DOCKERHUB_USER/$FRONTEND_IMAGE:latest
                      docker push $DOCKERHUB_USER/$FRONTEND_IMAGE:${BUILD_NUMBER}
                      docker push $DOCKERHUB_USER/$FRONTEND_IMAGE:latest
                    '''
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
