import { Alert } from "react-native";
import { supabase } from "../../lib/supabase";


export const fetchSkills = async () => {
    try {
        const { data, error } = await supabase
            .from('skills')
            .select('*');
        
        if (error) {
            Alert.alert(error.message);
            return;
        }
    
        return data;
        
    } catch (error) {
        Alert.alert(error.message);
    }
}
