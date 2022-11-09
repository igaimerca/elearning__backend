pipeline {    
    agent any
    tools {nodejs "Node v16"}
    
    environment {
        HOME = '.'
    }
    stages {
        stage('Install') { 
            steps {
                sh 'npm install' 
            }
        }
        stage('Build') { 
            steps {
                script {
                        sh 'npm run build' 
                    }
                }
            }
    }
}
