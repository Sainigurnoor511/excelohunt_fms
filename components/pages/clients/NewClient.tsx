"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateClient } from "@/lib/hooks/use-clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NewClient() {
  const router = useRouter();
  const createClient = useCreateClient();

  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createClient.mutateAsync({
        client_name: clientName,
        company_name: companyName || undefined,
        contact_person: contactPerson || undefined,
        email: email || undefined,
        phone_number: phoneNumber || undefined,
        address: address || undefined,
        location: location || undefined,
        website: website || undefined,
        notes: notes || undefined,
      });

      router.push("/clients");
    } catch (error) {
      console.error("Failed to create client:", error);
      alert("Failed to create client. Please try again.");
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Client</h1>
        <p className="mt-2 text-gray-600">Add a new client to the system</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                placeholder="e.g., Fashion Brand Inc"
              />
            </div>

            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Fashion Brand Inc"
              />
            </div>

            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g., John Doe"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@example.com"
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 234 567 8900"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Street address..."
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York, USA"
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Additional notes..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={createClient.isPending}>
            {createClient.isPending ? "Creating..." : "Create Client"}
          </Button>
        </div>
      </form>
    </div>
  );
}

