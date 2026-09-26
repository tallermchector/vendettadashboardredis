
'use client';

import { useState } from "react";
import { MessageList } from "./message-list";
import { MessageFolderList } from "./message-folder-list";
import { FullMessage, UserWithProgress } from "@/lib/data";
import { MessageCategory } from "@/types/enums";
import { ComposeMessage } from "./compose-message";

interface MessagesViewProps {
    currentUser: UserWithProgress;
    initialMessages: FullMessage[];
    allUsers: { id: string; name: string }[];
    initialCategory: string;
}

export function MessagesView({ currentUser, initialMessages, allUsers, initialCategory }: MessagesViewProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
    const [selectedMessage, setSelectedMessage] = useState<FullMessage | null>(null);

    const filteredMessages = initialMessages.filter(m => m.category === selectedCategory);

    return (
        <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Centro de Mensajes</h2>
                    <p className="text-muted-foreground">
                        Comunícate con otros jugadores y mantente al tanto de las novedades.
                    </p>
                </div>
                <ComposeMessage allUsers={allUsers} currentUser={currentUser} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
                <MessageFolderList 
                    selectedCategory={selectedCategory} 
                    setSelectedCategory={setSelectedCategory} 
                />
                <MessageList 
                    messages={filteredMessages}
                    selectedMessage={selectedMessage}
                    setSelectedMessage={setSelectedMessage}
                    categoryName={selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).toLowerCase()}
                />
            </div>
        </div>
    );
}
