import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Upload,
  Image,
  Video,
  File,
  Trash2,
  Download,
  Copy,
  MoreVertical,
  Grid3x3,
  List,
  Folder,
  Tag,
} from 'lucide-react';

type AssetType = 'image' | 'video' | 'document' | 'all';
type ViewMode = 'grid' | 'list';

interface Asset {
  id: string;
  name: string;
  type: AssetType;
  size: string;
  url: string;
  tags: string[];
  folder: string;
  uploadedAt: Date;
  usageCount: number;
}

const ASSET_TYPE_ICONS: Record<string, typeof Image> = {
  image: Image,
  video: Video,
  document: File,
};

const ASSET_TYPE_COLORS: Record<string, string> = {
  image: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  video: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  document: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const MOCK_ASSETS: Asset[] = [
  {
    id: '1',
    name: 'Product Launch Banner.jpg',
    type: 'image',
    size: '2.4 MB',
    url: '/placeholder-image.jpg',
    tags: ['marketing', 'product'],
    folder: 'Marketing',
    uploadedAt: new Date('2025-11-10'),
    usageCount: 5,
  },
  {
    id: '2',
    name: 'Tutorial Video.mp4',
    type: 'video',
    size: '15.8 MB',
    url: '/placeholder-video.mp4',
    tags: ['tutorial', 'education'],
    folder: 'Content',
    uploadedAt: new Date('2025-11-09'),
    usageCount: 12,
  },
  {
    id: '3',
    name: 'Brand Guidelines.pdf',
    type: 'document',
    size: '856 KB',
    url: '/brand-guidelines.pdf',
    tags: ['brand', 'reference'],
    folder: 'Resources',
    uploadedAt: new Date('2025-11-08'),
    usageCount: 3,
  },
  {
    id: '4',
    name: 'Team Photo.jpg',
    type: 'image',
    size: '3.2 MB',
    url: '/team-photo.jpg',
    tags: ['team', 'corporate'],
    folder: 'Marketing',
    uploadedAt: new Date('2025-11-07'),
    usageCount: 8,
  },
  {
    id: '5',
    name: 'Product Demo.mp4',
    type: 'video',
    size: '24.5 MB',
    url: '/demo-video.mp4',
    tags: ['product', 'demo'],
    folder: 'Content',
    uploadedAt: new Date('2025-11-06'),
    usageCount: 15,
  },
  {
    id: '6',
    name: 'Social Media Template.png',
    type: 'image',
    size: '1.8 MB',
    url: '/template.png',
    tags: ['template', 'social'],
    folder: 'Templates',
    uploadedAt: new Date('2025-11-05'),
    usageCount: 22,
  },
];

export default function ContentLibrary() {
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<AssetType>('all');
  const [filterFolder, setFilterFolder] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const { toast } = useToast();

  const folders = Array.from(new Set(assets.map((a) => a.folder)));

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesFolder = filterFolder === 'all' || asset.folder === filterFolder;
    return matchesSearch && matchesType && matchesFolder;
  });

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'URL Copied',
      description: 'Asset URL has been copied to clipboard',
    });
  };

  const handleDelete = (id: string) => {
    setAssets(assets.filter((a) => a.id !== id));
    toast({
      title: 'Asset Deleted',
      description: 'The asset has been removed from your library',
    });
  };

  const handleUpload = () => {
    // Mock upload
    toast({
      title: 'Upload Started',
      description: 'Your files are being uploaded...',
    });
    setIsUploadOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Folder className="w-8 h-8 text-primary" />
              Content Library
            </h1>
            <p className="text-muted-foreground">
              Manage and organize your media assets
            </p>
          </div>

          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Upload Assets
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Upload New Assets</DialogTitle>
                <DialogDescription>
                  Add images, videos, or documents to your content library
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF, MP4, PDF up to 50MB
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Folder</label>
                  <Select defaultValue="Marketing">
                    <SelectTrigger>
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Content">Content</SelectItem>
                      <SelectItem value="Resources">Resources</SelectItem>
                      <SelectItem value="Templates">Templates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags (optional)</label>
                  <Input placeholder="e.g., product, launch, banner" />
                </div>

                <Button onClick={handleUpload} className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Image className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {assets.filter((a) => a.type === 'image').length}
                </p>
                <p className="text-sm text-muted-foreground">Images</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Video className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {assets.filter((a) => a.type === 'video').length}
                </p>
                <p className="text-sm text-muted-foreground">Videos</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <File className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {assets.filter((a) => a.type === 'document').length}
                </p>
                <p className="text-sm text-muted-foreground">Documents</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Folder className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{folders.length}</p>
                <p className="text-sm text-muted-foreground">Folders</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="glass-card p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or tags..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={filterType} onValueChange={(v) => setFilterType(v as AssetType)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterFolder} onValueChange={setFilterFolder}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Folders</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder} value={folder}>
                    {folder}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Assets Display */}
        {filteredAssets.length === 0 ? (
          <Card className="glass-card p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No assets found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or upload new content
            </p>
            <Button onClick={() => setIsUploadOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Upload Assets
            </Button>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => {
              const Icon = ASSET_TYPE_ICONS[asset.type];
              return (
                <Card key={asset.id} className="glass-card p-4 group hover:border-primary/50 transition-colors">
                  <div className="aspect-video bg-accent/30 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                    <Icon className="w-16 h-16 text-muted-foreground/50" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleCopyUrl(asset.url)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(asset.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm truncate flex-1">{asset.name}</h3>
                      <Button size="icon" variant="ghost" className="h-6 w-6 flex-shrink-0">
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge className={ASSET_TYPE_COLORS[asset.type]} variant="outline">
                        {asset.type}
                      </Badge>
                      <span>•</span>
                      <span>{asset.size}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {asset.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="w-2 h-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                      <span>Used {asset.usageCount}x</span>
                      <span>{asset.uploadedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="glass-card divide-y divide-border">
            {filteredAssets.map((asset) => {
              const Icon = ASSET_TYPE_ICONS[asset.type];
              return (
                <div key={asset.id} className="p-4 hover:bg-accent/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-accent/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-8 h-8 text-muted-foreground/50" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{asset.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <Badge className={ASSET_TYPE_COLORS[asset.type]} variant="outline">
                          {asset.type}
                        </Badge>
                        <span>{asset.size}</span>
                        <span>•</span>
                        <span>{asset.folder}</span>
                        <span>•</span>
                        <span>Used {asset.usageCount}x</span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {asset.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="w-2 h-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" onClick={() => handleCopyUrl(asset.url)}>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy URL
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(asset.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
