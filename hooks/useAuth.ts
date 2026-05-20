"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export function useAuth() {
    const supabase = createClient();
    
    const signOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return { signOut };
}
