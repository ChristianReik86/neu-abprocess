"use client";

import { useSession } from "next-auth/react";
import { Bell, User } from "lucide-react";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-gray-50">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <User className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {session?.user?.name || session?.user?.email}
          </span>
        </div>
      </div>
    </header>
  );
}
