import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useProfile } from "@/context/ProfileContext";
import { Camera, Upload, X } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";

const profileFormSchema = z.object({
  full_name: z.string().min(1, { message: "Full name is required." }),
  phone: z.string().min(1, { message: "Phone number is required." }),
  address_line_1: z.string().min(1, { message: "Address is required." }),
  address_line_2: z.string().optional(),
  city: z.string().min(1, { message: "City is required." }),
  state: z.string().min(1, { message: "State is required." }),
  postal_code: z.string().min(1, { message: "Postal code is required." }),
  country: z.string().min(1, { message: "Country is required." }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  onSuccess?: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSuccess }) => {
  const { profile, createProfile, updateProfile, loading } = useProfile();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // uploadingPhoto removed as it was unused

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      address_line_1: profile?.address_line_1 || "",
      address_line_2: profile?.address_line_2 || "",
      city: profile?.city || "",
      state: profile?.state || "",
      postal_code: profile?.postal_code || "",
      country: profile?.country || "",
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showError('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showError('Image size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (values: ProfileFormValues) => {
    try {
      if (profile) {
        await updateProfile(values);
      } else {
        await createProfile(values);
      }

      // Profile picture upload logic needs to be implemented in context first
      if (selectedFile) {
        showSuccess('Profile updated successfully! (Photo upload to be implemented)');
      } else {
        showSuccess('Profile updated successfully!');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      showError('Failed to save profile');
    }
  };

  const displayImage = previewUrl || profile?.profile_picture_url;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="flex flex-col items-center space-y-4 p-4 border border-border rounded-lg">
          <div className="relative">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Camera className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            {(previewUrl || profile?.profile_picture_url) && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={handleRemovePhoto}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="flex flex-col items-center space-y-2">
            <label htmlFor="profile-picture" className="cursor-pointer">
              <Button type="button" variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {profile?.profile_picture_url ? 'Change Photo' : 'Upload Photo'}
                </span>
              </Button>
            </label>
            <input
              id="profile-picture"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground text-center">
              JPG, PNG or GIF (max 5MB)
            </p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter your phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address_line_1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 1</FormLabel>
              <FormControl>
                <Input placeholder="Enter your address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address_line_2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 2 (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Apartment, suite, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Enter city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input placeholder="Enter state" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter postal code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="Enter country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Saving...' : (profile ? 'Update Profile' : 'Create Profile')}
        </Button>
      </form>
    </Form>
  );
};