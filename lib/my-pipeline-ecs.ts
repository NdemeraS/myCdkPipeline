import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import ecs = require('aws-cdk-lib/aws-ecs');
import * as ecr from 'aws-cdk-lib/aws-ecr';
import ec2 = require('aws-cdk-lib/aws-ec2');
import elbv2 = require('aws-cdk-lib/aws-elasticloadbalancingv2');
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class EcsTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'Vpc', { maxAzs: 2 });
    // Create an ECS cluster
    const cluster = new ecs.Cluster(this, 'Cluster', { vpc });

    // Add capacity to it
    cluster.addCapacity('DefaultAutoScalingGroupCapacity', {
      instanceType: new ec2.InstanceType("t2.xlarge"),
      desiredCapacity: 3,
    });

    const repository = ecr.Repository.fromRepositoryName(
        this,
        'ExistingRepo',
        'testing'  // Your existing repository name
      );

    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'TaskDef');

    taskDefinition.addContainer('DefaultContainer', {
    //   image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
      image: ecs.ContainerImage.fromEcrRepository(repository, '1.0'),
      memoryLimitMiB: 2048,
      memoryReservationMiB: 1024,
      cpu: 1024,
    });

    // Instantiate an Amazon ECS Service
    const ecsService = new ecs.Ec2Service(this, 'Service', {
      cluster,
      taskDefinition,
      minHealthyPercent: 100,
      desiredCount: 2,
    });
  
  }
}
