
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// Actually, standard client is better if we pass the auth token, but for simplicity in this MVP 
// and since we are in a server environment, we can use the service role key CAREFULLY 
// or better yet, creating a client that inherits the user's session if possible.
// However, Next.js App Router API routes don't automatically have the user session unless we use createServerComponentClient or similar from helper package.
// But the user didn't install @supabase/auth-helpers-nextjs or @supabase/ssr. 
// They only have @supabase/supabase-js.

// So we will use the standard client and rely on RLS, but we need the user's access token.
// The cleanest way without extra packages is to expect the client to send the access token in headers, 
// OR simpler for this "fix it properly" request: use the Service Role key but MANUALLY verify the user ID passed in the body matches the session? 
// No, that's insecure.
// Let's stick to the pattern used in the rest of the app: client-side requests mostly. 
// BUT the user specifically asked for "Next API". 
// To make RLS work in API routes without the helpers, we usually need to forward the auth token.
// Let's try to keep it simple: The client will pass the session token in the Authorization header.

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const conversation_id = searchParams.get('conversation_id');
    const after = searchParams.get('after'); // Optional: fetch messages after a certain timestamp

    if (!conversation_id) {
        return NextResponse.json({ error: 'Missing conversation_id' }, { status: 400 });
    }

    // Create a client with the user's auth token
    const authHeader = request.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader || '' } },
    });

    let query = supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation_id)
        .order('created_at', { ascending: true });

    if (after) {
        query = query.gt('created_at', after);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { conversation_id, sender_id, text } = body;

        if (!conversation_id || !sender_id || !text) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const authHeader = request.headers.get('Authorization');
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader || '' } },
        });

        const { data, error } = await supabase
            .from('messages')
            .insert({ conversation_id, sender_id, text })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
