import sesClient from '../../config/SESConfig.js';
import { SendEmailCommand } from '@aws-sdk/client-ses';

export const sendEmail = async ({toEmail, subject, body}) => {
    const params = {
      Source: 'ryan@vairo.ai', // Verified sender email
      Destination: {
        ToAddresses: [toEmail],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: body, // Plain text version
            Charset: 'UTF-8',
          },
          Html: {
            Data: `<html><body>${body}</body></html>`, // HTML version
            Charset: 'UTF-8',
          },
        },
      },
    };
  
    try {
      const command = new SendEmailCommand(params);
      const response = await sesClient.send(command);
      console.log('Email sent successfully:', response);
      return response;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
};