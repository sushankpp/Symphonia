export const getAudioDuration = (url: string): Promise<number> => {
    return new Promise((resolve) => {
        const audio = new Audio(url);

        audio.addEventListener('loadedmetadata', () => {
            resolve(audio.duration);
        });

        audio.addEventListener('error', () => {
            console.error(`Error loading audio file: ${url}`);
            resolve(0); // Resolve with 0 duration on error
        });
    });
};

export const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};