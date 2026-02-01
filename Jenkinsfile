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
        COMPOSE_DIR = '/home/ec2-user/hostelhub'
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

                    if (msg.contains('[skip ci]')) {
                        currentBuild.description = 'Skipped CI loop'
                        error('CI loop detected')
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

        stage('Build & Push Images') {
            steps {
                script {
                    def backendVersion = readFile('backend.version').trim()
                    def frontendVersion = readFile('frontend.version').trim()

                    dockerBuildPush(
                        user: env.DOCKER_USER,
                        image: 'hostelhub-backend',
                        version: "v${backendVersion}",
                        dir: 'backend'
                    )

                    dockerBuildPush(
                        user: env.DOCKER_USER,
                        image: 'hostelhub-fron
