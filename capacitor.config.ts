import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'top.realme.tracker',
    appName: 'Ethereal Habit Tracker',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    }
};

export default config;
