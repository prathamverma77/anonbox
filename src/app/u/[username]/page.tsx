'use client';

import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { messageSchema } from '@/schemas/messageSchema';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* -------------------- CONSTANTS -------------------- */

const SEPARATOR = '||';

const defaultSuggestions = [
  "What's your favorite movie?",
  'Do you have any pets?',
  "What's your dream job?",
];

/* -------------------- PAGE -------------------- */

export default function SendMessagePage() {
  const params = useParams();
  const username = params?.username as string;

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: '' },
  });

  const messageContent = form.watch('content');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);

  // 👇 suggestions always exist (start with hardcoded)
  const [suggestions, setSuggestions] = useState<string[]>(
    defaultSuggestions
  );

  /* -------------------- AI SUGGESTIONS -------------------- */

  const fetchSuggestions = async () => {
    setIsSuggestLoading(true);
    try {
      const res = await fetch('/api/suggest-messages', {
        method: 'POST',
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        text += decoder.decode(value);
      }

      const aiSuggestions = text
        .split(SEPARATOR)
        .map(s => s.trim())
        .filter(Boolean);

      if (aiSuggestions.length > 0) {
        setSuggestions(aiSuggestions);
      }
    } catch (err) {
      toast.error('Failed to generate AI suggestions');
    } finally {
      setIsSuggestLoading(false);
    }
  };

  /* -------------------- SUBMIT MESSAGE -------------------- */

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    if (!username) {
      toast.error('Invalid user');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/send-message', {
        username,
        content: data.content,
      });

      toast.success(response.data.message || 'Message sent successfully');
      form.reset();
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message || 'Failed to send message'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Send an anonymous message
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Send Anonymous Message to @{username}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-center">
            <Button type="submit" disabled={isLoading || !messageContent}>
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send Message
            </Button>
          </div>
        </form>
      </Form>

      {/* -------------------- SUGGESTIONS -------------------- */}
      <div className="space-y-4 my-10">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Suggested Messages</h3>
          <Button
            onClick={fetchSuggestions}
            disabled={isSuggestLoading}
            variant="secondary"
          >
            {isSuggestLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Suggest with AI
          </Button>
        </div>

        <Card>
          <CardHeader>
            <p className="text-sm text-muted-foreground">
              Click any message to autofill
            </p>
          </CardHeader>
          <CardContent className="flex flex-col space-y-3">
            {suggestions.map((msg, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="text-left"
                onClick={() => form.setValue('content', msg)}
              >
                {msg}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      <div className="text-center">
        <p className="mb-4">Create your own anonymous message board</p>
        <Link href="/sign-up">
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
}
