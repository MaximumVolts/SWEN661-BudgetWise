import { useProfileController } from '../controllers/profileController';
import { ProfileScreen } from './screens/ProfileScreen';

/** 16 - Profile: connects its controller to the screen. */
export function ProfileView() {
  return <ProfileScreen controller={useProfileController()} />;
}
