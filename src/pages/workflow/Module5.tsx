import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Target, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Module5() {
  const navigate = useNavigate();
  
  const [offer, setOffer] = useState({
    uniqueValueProposition: '',
    axesOfBetter: '',
    floor: '',
    ceiling: '',
    fairPrice: '',
    demoNarrative: '',
    packaging: '',
    conciergeApproach: ''
  });

  const updateOffer = (field: keyof typeof offer, value: string) => {
    setOffer(prev => ({ ...prev, [field]: value }));
  };

  const isComplete = offer.uniqueValueProposition && offer.fairPrice && offer.demoNarrative;

  const handleBack = () => {
    navigate('/workflow/module4');
  };

  const handleComplete = () => {
    // Navigate back to main dashboard or show completion
    navigate('/');
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Module 5</Badge>
            <Target className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Designing the Offer - The Path to Solution Fit</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Translate your evidence-backed problem into a compelling offer that customers will commit to, before you build a product.
            </p>
          </div>
        </div>

        <Tabs defaultValue="promise" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="promise">Promise (UVP)</TabsTrigger>
            <TabsTrigger value="price">Price (Ask)</TabsTrigger>
            <TabsTrigger value="demo">Demo (Packaging)</TabsTrigger>
          </TabsList>

          <TabsContent value="promise" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Unique Value Proposition (UVP)</CardTitle>
                <CardDescription>
                  Design a promise that is 3x to 10x better than existing alternatives. Your UVP must directly answer the common pattern of friction you discovered.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Axes of Better</label>
                  <Textarea
                    value={offer.axesOfBetter}
                    onChange={(e) => updateOffer('axesOfBetter', e.target.value)}
                    placeholder="Based on the struggles you uncovered, what key attributes will your product improve? (e.g., speed, simplicity, quality, performance)"
                    className="min-h-[80px]"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Unique Value Proposition</label>
                  <Textarea
                    value={offer.uniqueValueProposition}
                    onChange={(e) => updateOffer('uniqueValueProposition', e.target.value)}
                    placeholder="A clear statement that describes what your product is, who it's for, and why it's different. Focus on the benefits customers will derive, not just features."
                    className="min-h-[100px]"
                  />
                </div>

                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      UVP Example
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Instead of: "A better social media tool"<br/>
                      Try: "The social media platform that creates posts for you and connects every view to an in-store visit"
                    </p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="price" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Strategy</CardTitle>
                <CardDescription>
                  Design a fair price between the floor (cost of existing alternative) and ceiling (value you deliver)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium">The Floor (Existing Alternative Cost)</label>
                    <Input
                      value={offer.floor}
                      onChange={(e) => updateOffer('floor', e.target.value)}
                      placeholder="e.g., $500/month for freelancer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      How much time, money, and effort are they already spending?
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">The Ceiling (Value Delivered)</label>
                    <Input
                      value={offer.ceiling}
                      onChange={(e) => updateOffer('ceiling', e.target.value)}
                      placeholder="e.g., $2000/month value from 10% increase"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Monetary value your UVP delivers to them
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Fair Price</label>
                  <Input
                    value={offer.fairPrice}
                    onChange={(e) => updateOffer('fairPrice', e.target.value)}
                    placeholder="e.g., $199/month"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Set between floor and ceiling - significantly cheaper than alternative, fraction of value delivered
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Demo & Packaging</CardTitle>
                <CardDescription>
                  Create the smallest possible thing that makes your promise believable. Focus on scripted narrative, not product tours.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Scripted Narrative</label>
                  <Textarea
                    value={offer.demoNarrative}
                    onChange={(e) => updateOffer('demoNarrative', e.target.value)}
                    placeholder="Script your demo as a 'before and after' story:
1. Before: Remind them of the specific friction you uncovered
2. Magic: Show key moments that eliminate that pain  
3. After: Display the tangible, desirable outcome"
                    className="min-h-[120px]"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Packaging Approach</label>
                  <Textarea
                    value={offer.packaging}
                    onChange={(e) => updateOffer('packaging', e.target.value)}
                    placeholder="How will you deliver the promised value in less than 2 months? Consider: No-code/Low-code tools, Manual delivery, Wizard of Oz MVP, etc."
                    className="min-h-[80px]"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Concierge MVP Details</label>
                  <Textarea
                    value={offer.conciergeApproach}
                    onChange={(e) => updateOffer('conciergeApproach', e.target.value)}
                    placeholder="If using a concierge approach, describe exactly how you'll manually deliver the outcome. What tools will you use behind the scenes?"
                    className="min-h-[80px]"
                  />
                </div>

                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Demo Example
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p><strong>Before:</strong> "You told me the most frustrating parts are daily content creation and not knowing if it works..."</p>
                      <p><strong>Magic:</strong> "Monday morning: email with 3 post suggestions. Just reply 'Yes' to your favorite."</p>
                      <p><strong>After:</strong> "Friday: report saying 'This week's post led to 15 new customers in your shop.'"</p>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Offer Summary */}
        {isComplete && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Your Complete Offer</CardTitle>
              <CardDescription>
                Ready for the Offer Delivery Sprint - pitch this to secure tangible commitments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Promise:</h4>
                <p className="text-sm text-muted-foreground">{offer.uniqueValueProposition}</p>
              </div>
              <div>
                <h4 className="font-semibold">Price:</h4>
                <p className="text-sm text-muted-foreground">{offer.fairPrice}</p>
              </div>
              <div>
                <h4 className="font-semibold">Demo Approach:</h4>
                <p className="text-sm text-muted-foreground">{offer.demoNarrative.substring(0, 150)}...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Module 4
          </Button>
          <Button 
            onClick={handleComplete}
            disabled={!isComplete}
            className="flex items-center gap-2"
          >
            Complete Workflow
          </Button>
        </div>
      </div>
    </div>
  );
}