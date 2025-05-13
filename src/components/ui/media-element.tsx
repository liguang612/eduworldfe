import React from 'react';
import { PlateElement } from '@udecode/plate/react';
import ReactPlayer from 'react-player';

export const MediaElement = React.forwardRef<
  HTMLVideoElement | HTMLAudioElement,
  React.HTMLAttributes<HTMLVideoElement | HTMLAudioElement> & {
    element: any;
  }
>(({ element, ...props }, ref) => {
  const Component = element.type === 'video' ? 'video' : 'audio';

  if (element.type === 'video') {
    return (
      <ReactPlayer
        ref={ref as any}
        url={element.url}
        controls
        width="100%"
        height="auto"
        className="max-w-full"
        onPlay={() => { }}
        onPause={() => { }}
        onEnded={() => { }}
        onError={() => { }}
        onProgress={() => { }}
        onDuration={() => { }}
        onReady={() => { }}
        onBuffer={() => { }}
        onBufferEnd={() => { }}
        onSeek={() => { }}
        onPlaybackRateChange={() => { }}
        onVolumeChange={() => { }}
      />
    );
  }

  return (
    <Component
      ref={ref as any}
      controls
      className={element.type === 'video' ? 'max-w-full h-auto' : 'w-full'}
      src={element.url}
      {...props}
    />
  );
});

MediaElement.displayName = 'MediaElement'; 