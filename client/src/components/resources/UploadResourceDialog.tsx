import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { useCreateResource } from '../../hooks/use-resources';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const createResourceSchema = z.object({
    title: z.string().min(1, "Title is required").max(100),
    description: z.string().min(1, "Description is required"),
    type: z.enum(["PDF", "DOCX", "ZIP", "IMAGE", "OTHER"]),
    fileUrl: z.string().min(1, "File is required"),
    tags: z.string().optional(), // Comma separated tags
});

type CreateResourceFormValues = z.infer<typeof createResourceSchema>;

interface UploadResourceDialogProps {
    groupId?: string;
}

export function UploadResourceDialog({ groupId }: UploadResourceDialogProps) {
    const [open, setOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const createResourceMutation = useCreateResource();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<CreateResourceFormValues>({
        resolver: zodResolver(createResourceSchema),
        defaultValues: {
            title: "",
            description: "",
            type: "PDF",
            fileUrl: "",
            tags: "",
        },
    });

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setFileName(file.name);

        // Auto-detect type if possible or default to OTHER
        const ext = file.name.split('.').pop()?.toUpperCase();
        if (['PDF', 'DOCX', 'ZIP'].includes(ext || '')) {
            form.setValue('type', ext as any);
        } else if (['JPG', 'JPEG', 'PNG', 'GIF'].includes(ext || '')) {
            form.setValue('type', 'IMAGE');
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            form.setValue('fileUrl', data.url);
        } catch (error) {
            console.error('Error uploading file:', error);
            setFileName(null);
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = (data: CreateResourceFormValues) => {
        const tagsArray = data.tags ? data.tags.split(',').map(t => t.trim()) : [];

        createResourceMutation.mutate({
            ...data,
            tags: tagsArray,
            groupId,
            fileType: data.type,
            fileSize: "Unknown" // We could get this from the file object if we stored it
        }, {
            onSuccess: () => {
                setOpen(false);
                form.reset();
                setFileName(null);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="gradient" glow>
                    <Upload className="w-5 h-5" />
                    Upload Resource
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upload Resource</DialogTitle>
                    <DialogDescription>
                        Share documents, guides, or notes with the community.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Calculus 101 Notes" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe what's in this resource..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>File Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PDF">PDF Document</SelectItem>
                                                <SelectItem value="DOCX">Word Document</SelectItem>
                                                <SelectItem value="ZIP">ZIP Archive</SelectItem>
                                                <SelectItem value="IMAGE">Image</SelectItem>
                                                <SelectItem value="OTHER">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tags (comma separated)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="math, exam, study" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="fileUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>File</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center gap-4">
                                            <Input
                                                type="file"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={handleFileUpload}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full border-dashed"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                            >
                                                {isUploading ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Upload className="mr-2 h-4 w-4" />
                                                )}
                                                {fileName || "Select File to Upload"}
                                            </Button>
                                            <input type="hidden" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={createResourceMutation.isPending || isUploading || !form.getValues('fileUrl')}>
                            {createResourceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Upload Resource
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
