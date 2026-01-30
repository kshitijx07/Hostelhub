@Library('hostelhub-lib') _

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
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                }
            }
        }

        stage('Build & Push Backend') {
            steps {
                dockerBuildPush(
                    user: DOCKERHUB_USER,
                    image: BACKEND_IMAGE,
                    tag: BUILD_NUMBER,
                    dir: 'backend'
                )
            }
        }

        stage('Build & Push Frontend') {
            steps {
                dockerBuildPush(
                    user: DOCKERHUB_USER,
                    image: FRONTEND_IMAGE,
                    tag: BUILD_NUMBER,
                    dir: 'fronted'
                )
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
