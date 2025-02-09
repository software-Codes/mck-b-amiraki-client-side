// src/components/GlobalModal.tsx
import React from 'react';
import { Modal, View, TouchableOpacity } from 'react-native';
import { useGlobalModal } from '../context/GlobalContext';

export const GlobalModal: React.FC = () => {
  const { showModal, modalContent, closeModal } = useGlobalModal();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showModal}
      onRequestClose={closeModal}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-center items-center"
        activeOpacity={1}
        onPress={closeModal}
      >
        <View 
          className="bg-white p-5 rounded-lg w-4/5 max-h-[80%] shadow-lg"
          onStartShouldSetResponder={() => true}
        >
          {modalContent}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};