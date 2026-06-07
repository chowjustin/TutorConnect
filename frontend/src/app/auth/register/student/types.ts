export interface RegisterStudentForm {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phoneNumber: string;
  whatsappNumber?: string;
  referralCode?: string;
}
