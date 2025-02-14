// src/screens/Announcements.tsx
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { useAdminAnnouncements } from '@/hooks/useAdminAnnouncements';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useAuth } from '@/hooks/useAuth';
import { Announcement } from '@/types/annoucements';
import React, { useState } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
// Assuming you have an auth hook

interface AnnouncementsScreenProps {
  navigation: any; // Replace with proper navigation type based on your setup
}

export default function AnnouncementsScreen({ navigation }: AnnouncementsScreenProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const { 
    announcements, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    refetch 
  } = useAnnouncements();
  
  const { 
    deleteAnnouncement,
    loading: adminLoading 
  } = useAdminAnnouncements();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      await refetch();
    } catch (err) {
      // Handle error (show toast, alert, etc.)
      console.error(err);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    navigation.navigate('EditAnnouncement', { announcement });
  };

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-danger-500 font-jakartaMedium text-center">
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-secondary-100">
      <FlatList
        data={announcements}
        renderItem={({ item }) => (
          <View className="px-4">
            <AnnouncementCard
              announcement={item}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </View>
        )}
        keyExtractor={item => item.id}
        contentContainerClassName="py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          isAdmin ? (
            <View className="px-4 mb-4">
              <Pressable
                onPress={() => navigation.navigate('CreateAnnouncement')}
                className="bg-primary-500 p-4 rounded-lg"
              >
                <Text className="text-white font-jakartaSemiBold text-center">
                  Create New Announcement
                </Text>
              </Pressable>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && !refreshing ? (
            <View className="py-4">
              <ActivityIndicator color="#0286FF" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View className="flex-1 items-center justify-center p-4">
              <Text className="text-secondary-700 font-jakartaMedium text-center">
                No announcements found
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}