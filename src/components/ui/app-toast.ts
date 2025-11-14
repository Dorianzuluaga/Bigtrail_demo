import { toast } from "@/components/ui/use-toast";

type ToastOptions = {
  title: string;
  description?: string;
};

export const appToast = {
  success: ({ title, description }: ToastOptions) =>
    toast({
      title,
      description,
    }),

  error: ({ title, description }: ToastOptions) =>
    toast({
      title,
      description,
      variant: "destructive",
    }),

  // info: ({ title, description }: ToastOptions) =>
  //   toast({
  //     title,
  //     description,
  //     variant: "default",
  //   }),
};
