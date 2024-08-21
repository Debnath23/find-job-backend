
export const ApiResponse = (data: object, message: string, status: number) => {
  return {
    data: data || null,   
    message: message || '',
    status: status || 200,
  };
};
