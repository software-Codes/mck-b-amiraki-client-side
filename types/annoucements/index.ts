export interface Announcement {
    id: string;
    title: string;
    content: string;
    status: 'draft' | 'published' | 'archived' | 'pinned';
    created_at: string;
    published_at: string | null;
    admin_name: string;
}

export interface  PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalAnnouncements: number;
    limit: number;
    
}

export interface AnnouncementsResponse  {
    annoucements: Announcement[];
    pagination: PaginationMeta;

}