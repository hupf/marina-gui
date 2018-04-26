pipeline {
  agent { label 'buildnode' }
  options {
    buildDiscarder(logRotator(numToKeepStr: '5'))
    timeout(time: 10, unit: 'MINUTES')
  }
  triggers {
    pollSCM('H/5 * * * *')
  }
  parameters {
    string(name: 'build_project', defaultValue: 'pitc-marina-build', description: 'The OpenShift Build Project')
    string(name: 'dev_project', defaultValue: 'pitc-marina-dev', description: 'The OpenShift Dev Project')
    string(name: 'test_project', defaultValue: 'pitc-marina-test', description: 'The OpenShift Test Project')
    string(name: 'prod_project', defaultValue: 'pitc-marina-prod', description: 'The OpenShift Prod Project')

    string(name: 'openshift_cluster', defaultValue: 'OpenShiftPuzzleProduction', description: 'The OpenShift Cluster')
    string(name: 'openshift_cluster_token', defaultValue: 'openshiftv3_prod_token_client_plugin', description: 'The OpenShift Cluster')
  }
  environment {
    NVM_HOME = tool('nvm')
    YARN_HOME = tool('yarn')
    PATH = "$YARN_HOME/bin:node_modules/.bin:$PATH"
  }
  stages {
    stage('Build') {
      steps {
        sh """#!/bin/bash +x
             source \${HOME}/.nvm/nvm.sh
             nvm install 8
             which node
             node --version
             which yarn
             yarn --version
             
             yarn install
             NODE_ENV=production yarn run build
           """
      }
    }
    stage('Build Docker Image') {
      steps {
        script {
          def ocDir = tool "oc"
          withEnv(["PATH+OC=${ocDir}/bin"]) {
            openshift.withCluster("${params.openshift_cluster}", "${params.openshift_cluster_token}") {
              openshift.withProject("${params.build_project}") {
                echo "Running in project: ${openshift.project()}"
                def buildSelector = openshift.startBuild("marina-gui")
                buildSelector.logs('-f')
              }
            }
          }
        }
      }
    }
    stage('Deploy to Dev') {
      steps {
        script {
          def ocDir = tool "oc"
          withEnv(["PATH+OC=${ocDir}/bin"]) {
            openshift.withCluster("${params.openshift_cluster}", "${params.openshift_cluster_token}") {
              openshift.withProject("${params.build_project}") {
                echo "Tagging dev, Project: ${openshift.project()}"
                def tagSelector = openshift.tag("${params.build_project}/marina-gui:latest", "${params.build_project}/marina-gui:dev")

              }
              openshift.withProject("${params.dev_project}") {
                echo "Deploying to dev, Project: ${openshift.project()}"
                def deploySelector = openshift.selector("dc/marina-gui").rollout().latest()

                def latestDeploymentVersion = openshift.selector('dc', "marina-gui").object().status.latestVersion
                def rc = openshift.selector('rc', "marina-gui-${latestDeploymentVersion}")
                rc.untilEach(1) {
                  def rcMap = it.object()
                  return (rcMap.status.replicas.equals(rcMap.status.readyReplicas))
                }
              }
            }
          }
        }
      }
    }
    stage('Integration Tests Dev') {
      steps {
        echo "Executing integration tests"
      }
    }
    stage('Deploy to Test') {
      steps {
        script {
          def ocDir = tool "oc"
          withEnv(["PATH+OC=${ocDir}/bin"]) {
            openshift.withCluster("${params.openshift_cluster}", "${params.openshift_cluster_token}") {
              openshift.withProject("${params.build_project}") {
                echo "Tagging dev, Project: ${openshift.project()}"
                def tagSelector = openshift.tag("${params.build_project}/marina-gui:dev", "pitc-marina-build/marina-gui:test")

              }
              openshift.withProject("${params.test_project}") {
                echo "Deploying to test, Project: ${openshift.project()}"
                def deploySelector = openshift.selector("dc/marina-gui").rollout().latest()
                def latestDeploymentVersion = openshift.selector('dc', "marina-gui").object().status.latestVersion
                def rc = openshift.selector('rc', "marina-gui-${latestDeploymentVersion}")
                rc.untilEach(1) {
                  def rcMap = it.object()
                  return (rcMap.status.replicas.equals(rcMap.status.readyReplicas))
                }
              }
            }
          }
        }
      }
    }
    stage('Integration Tests Test') {
      steps {
        echo "Executing integration tests"
      }
    }
    stage('Deploy to Prod') {
      steps {
        script {
          def ocDir = tool "oc"
          withEnv(["PATH+OC=${ocDir}/bin"]) {
            openshift.withCluster("${params.openshift_cluster}", "${params.openshift_cluster_token}") {
              openshift.withProject("${params.build_project}") {
                echo "Tagging dev, Project: ${openshift.project()}"
                def tagSelector = openshift.tag("${params.build_project}/marina-gui:test", "pitc-marina-build/marina-gui:prod")

              }
              openshift.withProject("${params.prod_project}") {
                echo "Deploying to prod, Project: ${openshift.project()}"
                def deploySelector = openshift.selector("dc/marina-gui").rollout().latest()
                def latestDeploymentVersion = openshift.selector('dc', "marina-gui").object().status.latestVersion
                def rc = openshift.selector('rc', "marina-gui-${latestDeploymentVersion}")
                rc.untilEach(1) {
                  def rcMap = it.object()
                  return (rcMap.status.replicas.equals(rcMap.status.readyReplicas))
                }
              }
            }
          }
        }
      }
    }
  }
  post {
    success {
      echo 'Success'
    }
    unstable {
      echo 'Unstable'
    }
    failure {
      echo 'Error'
    }
  }
}
