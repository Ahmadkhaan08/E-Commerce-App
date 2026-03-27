"use client";
import {
  addAddress,
  Address,
  AddressInput,
  deleteAddress,
  updateAddress,
} from "@/lib/addressApi";
import { useUserStore } from "@/lib/store";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface AddressSelectionProps {
  selectedAddress: Address | null;
  onAddressSelect: (address: Address) => void;
  addresses: Address[];
  onAddressUpdate: (addresses: Address[]) => void;
}
const AddressSelection: React.FC<AddressSelectionProps> = ({
  selectedAddress,
  onAddressSelect,
  addresses,
  onAddressUpdate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressInput>({
    street: "",
    city: "",
    country: "",
    postalCode: "",
    isDefault: false,
  });
  const { auth_token, authUser } = useUserStore();

  // update form when dialog opens
  useEffect(() => {
    if (isAddDialogOpen) {
      resetForm();
    }
  }, [isAddDialogOpen, addresses.length]);

  const resetForm = () => {
    setFormData({
      street: "",
      city: "",
      country: "",
      postalCode: "",
      isDefault: addresses.length === 0, //Auto check if this is the first address
    });
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser || !auth_token) return;
    setIsLoading(true);
    try {
      const result = await addAddress(authUser._id, formData, auth_token);
      onAddressUpdate(result.addresses);
      toast.success(result.message);
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add Address",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth_token || !authUser || !editingAddress) return;

    setIsLoading(true);
    try {
      const result = await updateAddress(
        authUser._id,
        editingAddress._id,
        formData,
        auth_token,
      );
      onAddressUpdate(result.addresses);
      toast.success(result.message);
      setIsEditDialogOpen(false);
      setEditingAddress(null);
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update Address",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!auth_token || !authUser) return;

    setIsLoading(true);
    try {
    } catch (error) {
        const result=await deleteAddress(authUser._id,addressId,auth_token)
        onAddressUpdate(result.addresses)
        toast.success(result.message)
        toast.error(
        error instanceof Error ? error.message : "Failed to delete Address"

        )
    } finally {
      setIsLoading(false);
    }
  };
  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      street: address.street,
      city: address.city,
      country: address.country,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
    });
    setIsEditDialogOpen(true);
  };
  return <div>AddressSelection</div>;
};

export default AddressSelection;
