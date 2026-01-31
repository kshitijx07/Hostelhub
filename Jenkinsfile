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

        stage('Versioning') {
            agent {
                docker {
                    image 'node:22'
                    args '-u root'
                }
            }
            steps {
                script {
                    BACKEND_VERSION  = bumpNpmVersion(dir: 'backend')
                    FRONTEND_VERSION = bumpNpmVersion(dir: 'fronted')

                    echo "Backend Version  : ${BACKEND_VERSION}"
                    echo "Frontend Version : ${FRONTEND_VERSION}"
                }
            }
        }

        stage('Build & Push Backend') {
            steps {
                dockerBuildPush(
                    user: DOCKERHUB_USER,
                    image: BACKEND_IMAGE,
                    version: BACKEND_VERSION,
                    dir: 'backend'
                )
            }
        }

        stage('Build & Push Frontend') {
            steps {
                dockerBuildPush(
                    user: DOCKERHUB_USER,
                    image: FRONTEND_IMAGE,
                    version: FRONTEND_VERSION,
                    dir: 'fronted'
                )
            }
        }
    }

    post {
        success {
            echo "✅ Images built with auto versioning"
        }
        failure {
            echo "❌ Pipeline failed"
        }
    }
}
