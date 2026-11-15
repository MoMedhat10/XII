import { Resend } from 'resend'

import { EMAIL_FROM } from '../../../../lib/email-from'



export const sendOTPEmail = async ({email , code , template}: {email: string , code: string , template: (OPT: string) => string}) => {
   try {

     const resend = new Resend(process.env.RESEND_API_KEY);
     const { error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: [email],
        subject: "XII Verification Code",
        html: template(code)
     })

     if(error){
        return {
           success: false , 
           message: "Failed to send email"  
        }
     }
     return {
        success: true , 
        message: "Email sent successfully"
     }
     
   } catch (error) {
    console.log("error => " , error);
     return {
        success: false ,
        message: "Something went wrong!"
     }
   } 
}



