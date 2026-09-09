export interface result {
  success: boolean;
  message: string;
  data?: {
    name?: string;
    email?: string;
    tel?: string;
    message: string;
  };
  errors: any;
  meta: any;
}

export const sendEmail = async (
  name: string,
  email: string,
  tel: string,
  message: string
) => {
  try {
    const client_id = import.meta.env.PUBLIC_CLIENT_ID;
    const response = await fetch("https://be.sysmapps.com/api/send-mail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, tel, message, client_id }),
    });

    const result: result = await response.json();
    if (!result.success) {
      throw new Error("Error al enviar el correo");
    }
    return {
      success: true,
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error al enviar el correo",
      data: null,
    };
  }
};

