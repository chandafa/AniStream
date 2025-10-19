'use client';

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Genre } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormEvent } from "react";

export function SearchClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('q') as string;
    const params = new URLSearchParams();
    if (query.trim()) {
        params.set('q', query);
        router.push(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <form onSubmit={handleSearchSubmit} className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          name="q"
          defaultValue={searchParams.get('q') || ''}
          placeholder="Search for an anime..."
          className="w-full pl-9"
        />
      </form>
    </div>
  );
}
