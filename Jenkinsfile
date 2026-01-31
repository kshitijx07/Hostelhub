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
                docker { image 'node:22' }
            }
            steps {
                script {
                    def BACKEND_VERSION  = bumpNpmVersion(dir: 'backend')
                    def FRONTEND_VERSION = bumpNpmVersion(dir: 'fronted')

                    env.BACKEND_VERSION  = BACKEND_VERSION
                    env.FRONTEND_VERSION = FRONTEND_VERSION

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
            echo "✅ Images built with auto versioning + build context"
        }
        failure {
            echo "❌ Pipeline failed"
        }
    }
}
