import { View, Text, Pressable } from 'react-native';
import { format } from 'date-fns';
import { Announcement } from '@/types/annoucements';

interface AnnouncementCardProps {
  announcement: Announcement;
  isAdmin: boolean;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (id: string) => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ 
  announcement, 
  isAdmin, 
  onEdit, 
  onDelete 
}) => {
  return (
    <View className="bg-white p-4 rounded-lg mb-4 shadow-sm">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-jakartaBold text-secondary-900 text-lg">
          {announcement.title}
        </Text>
        {isAdmin && (
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => onEdit?.(announcement)}
              className="bg-primary-500 px-3 py-1 rounded"
            >
              <Text className="text-white font-jakartaMedium">Edit</Text>
            </Pressable>
            <Pressable
              onPress={() => onDelete?.(announcement.id)}
              className="bg-danger-500 px-3 py-1 rounded"
            >
              <Text className="text-white font-jakartaMedium">Delete</Text>
            </Pressable>
          </View>
        )}
      </View>
      <Text className="text-secondary-700 font-jakartaRegular mb-2">
        {announcement.content}
      </Text>
      <View className="flex-row justify-between items-center">
        <Text className="text-secondary-500 font-jakartaLight text-sm">
          By {announcement.admin_name}
        </Text>
        <Text className="text-secondary-500 font-jakartaLight text-sm">
          {format(new Date(announcement.published_at || announcement.created_at), 'MMM dd, yyyy')}
        </Text>
      </View>
    </View>
  );
};