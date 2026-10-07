import crypto from "crypto"



export const generateOTPAndHashedOTP = (): [string , string] => {
    const otp = crypto.randomInt(100000, 1000000).toString();
 
    const otpHash = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    return [ otp, otpHash ]  ;
}

export const getHashedOTP = (otp: string) => {
    const otpHash = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    return otpHash;
}