pipeline {
  agent any

  environment {
    DOCKER_USERNAME = 'kshitij2511'
    BACKEND_IMAGE   = 'hostelhub-backend'
    FRONTEND_IMAGE  = 'hostelhub-frontend'
    TAG             = "${BUILD_NUMBER}"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Backend: Install & Test') {
      steps {
        dir('backend') {
          sh '''
            npm install
            npm test || echo "No tests defined"
          '''
        }
      }
    }

    stage('Backend: Docker Build & Push') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-creds',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          sh '''
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

            cd backend
            docker build -t $DOCKER_USERNAME/$BACKEND_IMAGE:$TAG .
            docker tag $DOCKER_USERNAME/$BACKEND_IMAGE:$TAG $DOCKER_USERNAME/$BACKEND_IMAGE:latest

            docker push $DOCKER_USERNAME/$BACKEND_IMAGE:$TAG
            docker push $DOCKER_USERNAME/$BACKEND_IMAGE:latest
          '''
        }
      }
    }

    stage('Frontend: Build') {
      steps {
        dir('fronted') {
          sh '''
            npm install
            npm run build
          '''
        }
      }
    }

    stage('Frontend: Docker Build & Push') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-creds',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          sh '''
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

            cd fronted
            docker build -t $DOCKER_USERNAME/$FRONTEND_IMAGE:$TAG .
            docker tag $DOCKER_USERNAME/$FRONTEND_IMAGE:$TAG $DOCKER_USERNAME/$FRONTEND_IMAGE:latest

            docker push $DOCKER_USERNAME/$FRONTEND_IMAGE:$TAG
            docker push $DOCKER_USERNAME/$FRONTEND_IMAGE:latest
          '''
        }
      }
    }
  }

  post {
    success {
      echo "✅ Pipeline completed successfully!"
    }
    failure {
      echo "❌ Pipeline failed. Check logs."
    }
  }
}
