import amqp, { connect } from 'amqplib'

let channel: amqp.Channel

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect({
        protocol: 'amqp',
        hostname: 'localhost',
        port: 5672,
        username: 'admin',
        password: 'admin123'
    })
    channel = await connection.createChannel()
    console.log('✅ Channel created and connected to RabbitMQ')
    await channel.assertQueue('author_queue')//for what= 
    console.log('Connected to RabbitMQ')
  } catch (error) {
    console.error('❌ Error connecting to RabbitMQ:', error)
  }
}

