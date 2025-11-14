import { useState, useEffect } from 'react';
import { ContentItem } from '@/types/content';
import { contentService } from '@/services/contentService';


export function useContent() {
    const [contents, setContents] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function fetchContents() {
        try{
            setLoading(true);
            const data = await contentService.getAllContents();
            setContents(data);
        }catch(err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

        useEffect(() => {
            fetchContents();
        },  []);
       

 return {contents, setContents, loading, error, refetch: fetchContents};
}