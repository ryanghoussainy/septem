import { Alert } from "react-native";
import { supabase } from "../../lib/supabase"
import Constants from "expo-constants";


/* Returns true if the version needs to be updated, false otherwise.
   This will only return true if the update is marked as mandatory. */
export const needToUpdate = async () => {
    try {
        // Get all versions that have a higher code than the current version
        const { data: versionsData, error: versionsError } = await supabase
            .from('app_versions')
            .select('version, is_mandatory')
            .gt('code', Constants.expoConfig.versionCode);

        if (versionsError) {
            Alert.alert(versionsError.message);
            return;
        }
        
        // Return true if any of the versions are mandatory
        return versionsData.some(version => version.is_mandatory);
        
    } catch (error) {
        Alert.alert(error.message);
    }
}
