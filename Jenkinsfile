@Library('hostelhub-lib@main') _

pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }

    environment {
        DOCKER_USER = 'kshitij2511'
        GIT_BRANCH  = 'main'
        SKIP_PIPELINE = 'false'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prevent CI Loop') {
            steps {
                script {
                    def author = sh(
                        script: "git log -1 --pretty=%an",
                        returnStdout: true
                    ).trim()

                    echo "Last commit author: ${author}"

                    if (author == 'jenkins-ci') {
                        echo '🔁 Jenkins-triggered commit detected — skipping remaining stages'
                        env.SKIP_PIPELINE = 'true'
                    }
                }
            }
        }

        stage('Docker Login') {
            when {
                expression { env.SKIP_PIPELINE != 'true' }
            }
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

        stage('Versioning') {
            when {
                expression { env.SKIP_PIPELINE != 'true' }
            }
            steps {
                script {
                    sh '''
                        set -e

                        echo "📦 Bumping backend version"
                        cd backend
                        npm version patch --no-git-tag-version
                        node -p "require('./package.json').version" > ../backend.version
                        cd ..

                        echo "📦 Bumping frontend version"
                        cd fronted
                        npm version patch --no-git-tag-version
                        node -p "require('./package.json').version" > ../frontend.version
                        cd ..
                    '''

                    env.BACKEND_VERSION  = readFile('backend.version').trim()
                    env.FRONTEND_VERSION = readFile('frontend.version').trim()

                    echo "Backend Version  : v${env.BACKEND_VERSION}"
                    echo "Frontend Version : v${env.FRONTEND_VERSION}"
                }
            }
        }

        stage('Commit Version Updates') {
            when {
                expression { env.SKIP_PIPELINE != 'true' }
            }
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

                        git config user.name "jenkins-ci"
                        git config user.email "jenkins@ci.local"

                        git add backend/package.json backend/package-lock.json || true
                        git add fronted/package.json fronted/package-lock.json || true

                        git diff --cached --quiet && echo "No version changes to commit" && exit 0

                        git commit -m "chore(ci): bump versions [skip ci]"
                        git push https://$GIT_USER:$GIT_PASS@github.com/kshitijx07/Hostelhub.git HEAD:main
                    '''
                }
            }
        }

        stage('Build & Push Backend') {
            when {
                expression { env.SKIP_PIPELINE != 'true' }
            }
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
            when {
                expression { env.SKIP_PIPELINE != 'true' }
            }
            steps {
                dockerBuildPush(
                    user: env.DOCKER_USER,
                    image: 'hostelhub-frontend',
                    version: "v${env.FRONTEND_VERSION}",
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
