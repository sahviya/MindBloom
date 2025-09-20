import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Shopping() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - in a real app, this would come from your backend
  const shoppingItems = {
    comfort: [
      { id: 1, name: "Cozy Weighted Blanket", price: "$49.99", category: "Home", description: "Soft, calming weighted blanket for better sleep and anxiety relief", image: "🛏️", link: "https://amazon.com/weighted-blanket", rating: 4.8 },
      { id: 2, name: "Aromatherapy Essential Oil Set", price: "$29.99", category: "Wellness", description: "Lavender, eucalyptus, and chamomile oils for relaxation", image: "🌿", link: "https://amazon.com/essential-oils", rating: 4.7 },
      { id: 3, name: "Meditation Cushion", price: "$34.99", category: "Wellness", description: "Comfortable cushion for meditation and mindfulness practice", image: "🧘", link: "https://amazon.com/meditation-cushion", rating: 4.6 },
      { id: 4, name: "Self-Care Tea Collection", price: "$24.99", category: "Food & Drink", description: "Herbal teas for relaxation, focus, and wellness", image: "🍵", link: "https://amazon.com/wellness-tea", rating: 4.5 },
    ],
    clothing: [
      { id: 5, name: "Soft Comfort Hoodie", price: "$42.99", category: "Clothing", description: "Ultra-soft, cozy hoodie perfect for relaxing days", image: "👕", link: "https://amazon.com/comfort-hoodie", rating: 4.9 },
      { id: 6, name: "Mindfulness T-Shirt", price: "$19.99", category: "Clothing", description: "Inspirational message tee to spread positive vibes", image: "👔", link: "https://amazon.com/mindfulness-tshirt", rating: 4.4 },
      { id: 7, name: "Cozy Pajama Set", price: "$38.99", category: "Clothing", description: "Breathable, soft pajamas for restful sleep", image: "🩱", link: "https://amazon.com/pajama-set", rating: 4.7 },
      { id: 8, name: "Wellness Socks", price: "$14.99", category: "Clothing", description: "Compression socks with positive affirmations", image: "🧦", link: "https://amazon.com/wellness-socks", rating: 4.3 },
    ],
    accessories: [
      { id: 9, name: "Gratitude Journal", price: "$16.99", category: "Accessories", description: "Beautiful journal for daily gratitude practice", image: "📖", link: "https://amazon.com/gratitude-journal", rating: 4.8 },
      { id: 10, name: "Crystal Healing Set", price: "$27.99", category: "Accessories", description: "Amethyst, rose quartz, and clear quartz crystals", image: "💎", link: "https://amazon.com/crystal-set", rating: 4.6 },
      { id: 11, name: "Mindful Water Bottle", price: "$22.99", category: "Accessories", description: "Motivational water bottle with time markers", image: "💧", link: "https://amazon.com/mindful-bottle", rating: 4.5 },
      { id: 12, name: "Zen Garden Kit", price: "$31.99", category: "Accessories", description: "Desktop zen garden for stress relief and focus", image: "🏞️", link: "https://amazon.com/zen-garden", rating: 4.7 },
    ],
  };

  const allItems = [...shoppingItems.comfort, ...shoppingItems.clothing, ...shoppingItems.accessories];
  
  const filteredItems = (items: any[]) => {
    if (!searchQuery) return items;
    return items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getRandomItems = (items: any[], count: number) => {
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="text-center mb-8 fade-in">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 genie-gradient rounded-full flex items-center justify-center glow-effect">
            <i className="fas fa-shopping-bag text-primary-foreground text-2xl"></i>
          </div>
        </div>
        <h1 className="text-4xl font-serif font-bold mb-4 genie-gradient bg-clip-text text-transparent">
          Comfort Shopping
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Treat yourself to comforting items that support your wellness journey. Sometimes a little retail therapy can brighten your day! ✨
        </p>
      </div>

      {/* Disclaimer */}
      <Card className="magical-border bg-primary/5 mb-8 fade-in">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 text-center">
            <i className="fas fa-info-circle text-primary text-xl"></i>
            <p className="text-sm text-muted-foreground">
              <strong>Self-Care Reminder:</strong> Shopping can be therapeutic, but remember that true happiness comes from within. 
              These items are suggestions for comfort and wellness, not necessities for your healing journey.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card className="magical-border mb-8 fade-in">
        <CardContent className="p-4">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
            <Input
              placeholder="Search for comfort items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="search-items"
            />
          </div>
        </CardContent>
      </Card>

      {/* Featured Deals */}
      <Card className="magical-border glow-effect mb-8 fade-in">
        <CardHeader>
          <CardTitle className="text-center text-xl font-serif text-primary flex items-center justify-center">
            <i className="fas fa-star mr-2"></i>
            ✨ Wellness Favorites ✨
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getRandomItems(allItems, 4).map((item) => (
              <div key={item.id} className="text-center group">
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{item.image}</div>
                <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.name}</h3>
                <p className="text-primary font-semibold">{item.price}</p>
                <div className="flex items-center justify-center mt-1">
                  <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }, (_, i) => (
                      <i key={i} className={`fas fa-star text-xs ${i < Math.floor(item.rating) ? '' : 'opacity-30'}`}></i>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground ml-1">({item.rating})</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shopping Categories */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="all" data-testid="tab-all">All Items</TabsTrigger>
          <TabsTrigger value="comfort" data-testid="tab-comfort">Comfort</TabsTrigger>
          <TabsTrigger value="clothing" data-testid="tab-clothing">Clothing</TabsTrigger>
          <TabsTrigger value="accessories" data-testid="tab-accessories">Accessories</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems(allItems).map((item) => (
              <Card key={item.id} className="hover:magical-border hover:glow-effect transition-all group" data-testid={`item-${item.id}`}>
                <CardContent className="p-4">
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{item.image}</div>
                    <Badge variant="outline" className="text-xs mb-2">{item.category}</Badge>
                  </div>
                  <h3 className="font-medium mb-2 line-clamp-2">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold text-primary">{item.price}</span>
                    <div className="flex items-center">
                      <div className="flex text-yellow-400 mr-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <i key={i} className={`fas fa-star text-xs ${i < Math.floor(item.rating) ? '' : 'opacity-30'}`}></i>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">({item.rating})</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full genie-gradient hover:opacity-90" 
                    asChild
                    data-testid={`buy-${item.id}`}
                  >
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      <i className="fas fa-shopping-cart mr-2"></i>
                      View on Amazon
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comfort" className="fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems(shoppingItems.comfort).map((item) => (
              <Card key={item.id} className="hover:magical-border hover:glow-effect transition-all group" data-testid={`comfort-${item.id}`}>
                <CardContent className="p-4">
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{item.image}</div>
                    <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 text-xs mb-2">Comfort</Badge>
                  </div>
                  <h3 className="font-medium mb-2 line-clamp-2">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold text-primary">{item.price}</span>
                    <div className="flex items-center">
                      <div className="flex text-yellow-400 mr-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <i key={i} className={`fas fa-star text-xs ${i < Math.floor(item.rating) ? '' : 'opacity-30'}`}></i>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">({item.rating})</span>
                    </div>
                  </div>
                  <Button className="w-full genie-gradient hover:opacity-90" asChild>
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      <i className="fas fa-shopping-cart mr-2"></i>
                      View on Amazon
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="clothing" className="fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems(shoppingItems.clothing).map((item) => (
              <Card key={item.id} className="hover:magical-border hover:glow-effect transition-all group" data-testid={`clothing-${item.id}`}>
                <CardContent className="p-4">
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{item.image}</div>
                    <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs mb-2">Clothing</Badge>
                  </div>
                  <h3 className="font-medium mb-2 line-clamp-2">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold text-primary">{item.price}</span>
                    <div className="flex items-center">
                      <div className="flex text-yellow-400 mr-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <i key={i} className={`fas fa-star text-xs ${i < Math.floor(item.rating) ? '' : 'opacity-30'}`}></i>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">({item.rating})</span>
                    </div>
                  </div>
                  <Button className="w-full genie-gradient hover:opacity-90" asChild>
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      <i className="fas fa-shopping-cart mr-2"></i>
                      View on Amazon
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="accessories" className="fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems(shoppingItems.accessories).map((item) => (
              <Card key={item.id} className="hover:magical-border hover:glow-effect transition-all group" data-testid={`accessory-${item.id}`}>
                <CardContent className="p-4">
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{item.image}</div>
                    <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs mb-2">Accessories</Badge>
                  </div>
                  <h3 className="font-medium mb-2 line-clamp-2">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold text-primary">{item.price}</span>
                    <div className="flex items-center">
                      <div className="flex text-yellow-400 mr-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <i key={i} className={`fas fa-star text-xs ${i < Math.floor(item.rating) ? '' : 'opacity-30'}`}></i>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">({item.rating})</span>
                    </div>
                  </div>
                  <Button className="w-full genie-gradient hover:opacity-90" asChild>
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      <i className="fas fa-shopping-cart mr-2"></i>
                      View on Amazon
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Mindful Shopping Tips */}
      <Card className="magical-border mt-12 fade-in">
        <CardHeader>
          <CardTitle className="text-center text-xl font-serif text-primary">
            Mindful Shopping Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-heart text-green-600 dark:text-green-400 text-xl"></i>
              </div>
              <h3 className="font-medium mb-2">Buy with Intent</h3>
              <p className="text-sm text-muted-foreground">
                Choose items that truly support your wellness and bring you joy
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-balance-scale text-blue-600 dark:text-blue-400 text-xl"></i>
              </div>
              <h3 className="font-medium mb-2">Practice Balance</h3>
              <p className="text-sm text-muted-foreground">
                Treat shopping as occasional self-care, not regular therapy
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-lightbulb text-purple-600 dark:text-purple-400 text-xl"></i>
              </div>
              <h3 className="font-medium mb-2">Quality Over Quantity</h3>
              <p className="text-sm text-muted-foreground">
                Invest in fewer, higher-quality items that last longer
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
