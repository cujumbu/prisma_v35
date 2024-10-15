export const sendStatusUpdateEmail = async (to: string, claimNumber: string, newStatus: string) => {
  try {
    const response = await fetch('/api/send-status-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, claimNumber, newStatus }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};