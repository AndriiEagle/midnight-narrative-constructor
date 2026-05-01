import { createClient } from "@/lib/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa, type I18nVariables } from "@supabase/auth-ui-shared";
import { useEffect, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

const authLocalization: { variables: I18nVariables } = {
    variables: {
        sign_in: {
            email_label: "Електронна пошта",
            password_label: "Пароль",
            email_input_placeholder: "Ваша електронна пошта",
            password_input_placeholder: "Ваш пароль",
            button_label: "Увійти",
            loading_button_label: "Вхід...",
            link_text: "Вже маєте акаунт? Увійдіть",
        },
        sign_up: {
            email_label: "Електронна пошта",
            password_label: "Створіть пароль",
            email_input_placeholder: "Ваша електронна пошта",
            password_input_placeholder: "Ваш пароль",
            button_label: "Зареєструватися",
            loading_button_label: "Створюю акаунт...",
            link_text: "Немає акаунта? Зареєструйтеся",
            confirmation_text: "Перевірте пошту, щоб підтвердити реєстрацію",
        },
        forgotten_password: {
            email_label: "Електронна пошта",
            email_input_placeholder: "Ваша електронна пошта",
            button_label: "Надіслати інструкції для скидання",
            loading_button_label: "Надсилаю інструкції...",
            link_text: "Забули пароль?",
            confirmation_text: "Перевірте пошту, щоб скинути пароль",
        },
        magic_link: {
            email_input_label: "Електронна пошта",
            email_input_placeholder: "Ваша електронна пошта",
            button_label: "Надіслати посилання для входу",
            loading_button_label: "Надсилаю посилання для входу...",
            link_text: "Увійти через посилання",
            confirmation_text: "Перевірте пошту, щоб увійти через посилання",
            empty_email_address: "Спершу введіть електронну пошту",
        },
        update_password: {
            password_label: "Новий пароль",
            password_input_placeholder: "Ваш новий пароль",
            button_label: "Оновити пароль",
            loading_button_label: "Оновлюю пароль...",
            confirmation_text: "Пароль оновлено",
        },
        verify_otp: {
            email_input_label: "Електронна пошта",
            email_input_placeholder: "Ваша електронна пошта",
            phone_input_label: "Номер телефону",
            phone_input_placeholder: "Ваш номер телефону",
            token_input_label: "Код",
            token_input_placeholder: "Введіть код",
            button_label: "Підтвердити код",
            loading_button_label: "Підтверджую...",
        },
    },
};

function localizeAuthConfigError(error: unknown) {
    const message = error instanceof Error ? error.message : "";

    if (message === "Missing Supabase environment variables.") {
        return "Відсутні змінні середовища Supabase.";
    }

    return message || "Supabase не налаштовано.";
}

interface AuthOverlayProps {
    onClose: () => void;
    onAuthenticated: (user: User) => void;
}

export function AuthOverlay({ onClose, onAuthenticated }: AuthOverlayProps) {
    const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null);
    const [configError, setConfigError] = useState<string | null>(null);

    useEffect(() => {
        try {
            setSupabase(createClient());
            setConfigError(null);
        } catch (error) {
            setSupabase(null);
            setConfigError(localizeAuthConfigError(error));
        }
    }, []);

    useEffect(() => {
        if (!supabase) {
            return;
        }

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                onAuthenticated(session.user);
            }
        });

        return () => subscription.unsubscribe();
    }, [onAuthenticated, supabase]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-sm rounded-xl border border-accent/20 bg-[#0a0a0a] p-8 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-xs tracking-widest text-[#888] hover:text-white transition-colors"
                >
                    ЗАКРИТИ
                </button>

                <div className="mb-6 text-center">
                    <h2 className="text-sm uppercase tracking-[0.3em] font-medium text-accent">Доступ до архіву</h2>
                    <p className="mt-2 text-xs text-[#666]">Увійдіть, щоб безпечно зберегти свою новелу в хмарі.</p>
                </div>

                {configError ? (
                    <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm leading-6 text-rose-200">
                        {configError}
                    </div>
                ) : supabase ? (
                    <Auth
                        supabaseClient={supabase}
                        appearance={{
                            theme: ThemeSupa,
                            variables: {
                                default: {
                                    colors: {
                                        brand: "#bb86fc",
                                        brandAccent: "#9b61e0",
                                        inputBackground: "transparent",
                                        inputBorder: "#333",
                                        inputText: "white",
                                    },
                                },
                            },
                        }}
                        theme="dark"
                        providers={[]}
                        localization={authLocalization}
                    />
                ) : (
                    <div className="text-sm text-[#888]">Готую безпечний вхід...</div>
                )}
            </div>
        </div>
    );
}
