import React from 'react';
import Image from 'next/image';

interface ToggleSwitchProps {
  isRightEnabled: boolean;
  onToggle: () => void;
  leftIcon: string;
  rightIcon: string;
  leftInactiveIcon?: string;
  rightInactiveIcon?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isRightEnabled, onToggle, leftIcon, rightIcon, leftInactiveIcon = leftIcon, rightInactiveIcon = rightIcon }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Image src={isRightEnabled ? leftInactiveIcon : leftIcon} alt="Left Icon" width={28} height={28} />
      <div
        style={{
          width: '32px',
          height: '16px',
          backgroundColor: isRightEnabled ? '#0a84ff' : '#3a3a3c',
          borderRadius: '16px',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onClick={onToggle}
      >
        <div
          style={{
            position: 'absolute',
            width: '14px',
            height: '14px',
            backgroundColor: '#fff',
            borderRadius: '50%',
            top: '1px',
            left: isRightEnabled ? '17px' : '1px',
            transition: 'left 0.2s'
          }}
        />
      </div>
      <Image src={isRightEnabled ? rightIcon : rightInactiveIcon} alt="Right Icon" width={28} height={28} />
    </div>
  );
};

export default ToggleSwitch; 