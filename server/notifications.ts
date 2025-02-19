import { type Appointment } from '@shared/schema';
import mailgun from 'mailgun-js';
import { format, toZonedTime } from 'date-fns-tz';

// Initialize Mailgun client
const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY || '',
  domain: process.env.MAILGUN_DOMAIN || ''
});

// Helper function to format date and time consistently
function formatAppointmentDateTime(date: Date | string) {
  const appointmentDate = date instanceof Date ? date : new Date(date);
  // Convert to IST (Indian Standard Time)
  const istDate = toZonedTime(appointmentDate, 'Asia/Kolkata');

  return {
    date: format(istDate, 'EEEE, MMMM d, yyyy', { timeZone: 'Asia/Kolkata' }),
    time: format(istDate, 'h:mm a', { timeZone: 'Asia/Kolkata' })
  };
}

export async function sendAppointmentConfirmation(
  toEmail: string,
  appointment: Appointment & { doctorName: string; location: string }
): Promise<boolean> {
  try {
    if (!isValidEmail(toEmail)) {
      console.error('Invalid recipient email address:', toEmail);
      return false;
    }

    const { date, time } = formatAppointmentDateTime(appointment.date);

    const directionsLink = generateDirectionsLink(appointment.location);

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb;">Your Appointment is Confirmed!</h2>

      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Appointment Details:</h3>
        <p><strong>Doctor:</strong> ${appointment.doctorName}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time} IST</p>
        <p><strong>Location:</strong> ${appointment.location}</p>
      </div>

      <p style="color: #4b5563;"><strong>Important:</strong> Please arrive 15 minutes before your scheduled appointment time.</p>

      <p style="color: #4b5563;">Get directions to the clinic: <a href="${directionsLink}" style="color: #2563eb;">Click here for directions</a></p>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280;">Best regards,<br>Your Healthcare Team</p>
      </div>
    </div>`;

    const textContent = `
Your Appointment is Confirmed!

Appointment Details:
- Doctor: ${appointment.doctorName}
- Date: ${date}
- Time: ${time} IST
- Location: ${appointment.location}

Important: Please arrive 15 minutes before your scheduled appointment time.

Get directions to the clinic: ${directionsLink}

Best regards,
Your Healthcare Team`;

    await mg.messages().send({
      from: `Doctor Appointments <mailgun@${process.env.MAILGUN_DOMAIN}>`,
      to: toEmail,
      subject: 'Your Appointment Confirmation',
      text: textContent,
      html: htmlContent
    });

    return true;
  } catch (error) {
    console.error('Failed to send appointment confirmation email:', error);
    return false;
  }
}

export async function sendAppointmentReminder(
  toEmail: string,
  appointment: Appointment & { doctorName: string; location: string }
): Promise<boolean> {
  try {
    if (!isValidEmail(toEmail)) {
      console.error('Invalid recipient email address:', toEmail);
      return false;
    }

    const { date, time } = formatAppointmentDateTime(appointment.date);
    const directionsLink = generateDirectionsLink(appointment.location);

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb;">Appointment Reminder</h2>

      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Your appointment is in 1 hour:</h3>
        <p><strong>Doctor:</strong> ${appointment.doctorName}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time} IST</p>
        <p><strong>Location:</strong> ${appointment.location}</p>
      </div>

      <div style="margin: 20px 0;">
        <a href="${directionsLink}" 
           style="background-color: #2563eb; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Get Directions to Clinic
        </a>
      </div>

      <p style="color: #4b5563;"><strong>Remember:</strong> Please arrive 15 minutes before your scheduled time.</p>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280;">Best regards,<br>Your Healthcare Team</p>
      </div>
    </div>`;

    const textContent = `
Appointment Reminder

Your appointment is in 1 hour:
- Doctor: ${appointment.doctorName}
- Date: ${date}
- Time: ${time} IST
- Location: ${appointment.location}

Get directions to the clinic: ${directionsLink}

Remember: Please arrive 15 minutes before your scheduled time.

Best regards,
Your Healthcare Team`;

    await mg.messages().send({
      from: `Doctor Appointments <mailgun@${process.env.MAILGUN_DOMAIN}>`,
      to: toEmail,
      subject: 'Reminder: Your Appointment is in 1 Hour',
      text: textContent,
      html: htmlContent
    });

    return true;
  } catch (error) {
    console.error('Failed to send appointment reminder email:', error);
    return false;
  }
}

// Keep existing helper functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function generateDirectionsLink(doctorLocation: string): string {
  const encodedLocation = encodeURIComponent(doctorLocation);
  return `https://www.google.com/maps/dir/?api=1&destination=${encodedLocation}`;
}