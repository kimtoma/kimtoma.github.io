import React from 'react';

export enum ContentType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  NOTE = 'NOTE',
  AUDIO = 'AUDIO',
  WIDGET = 'WIDGET'
}

export enum ViewType {
  HOME = 'HOME',
  ABOUT = 'ABOUT',
  BLOG = 'BLOG',
  PROJECTS = 'PROJECTS',
  EXPERIMENTS = 'EXPERIMENTS'
}

export interface CardData {
  id: string;
  type: ContentType;
  title?: string;
  content: string | React.ReactNode;
  x: number; // Percentage X relative to screen center
  y: number; // Percentage Y relative to screen center
  z: number; // Z-index depth transform in pixels
  rotation: number; // Degrees
  width?: string;
  height?: string;
  color?: string; // Optional custom bg color
  delay?: string; // Animation delay class
  noPadding?: boolean; // Optional: remove padding for full-bleed widgets
}