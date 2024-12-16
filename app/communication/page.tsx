'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CommunicationPage() {
  const [messages, setMessages] = useState([
    { id: 1, to: "John Doe", subject: "Appointment Reminder", content: "Don't forget Max's checkup tomorrow at 2 PM.", date: "2023-06-15" },
    { id: 2, to: "Jane Smith", subject: "Test Results", content: "Whiskers' blood work came back normal.", date: "2023-06-16" },
  ])

  const [newMessage, setNewMessage] = useState({
    to: '',
    subject: '',
    content: '',
  })

  const [articles, setArticles] = useState([
    { id: 1, title: "Summer Pet Care Tips", content: "Keep your pets cool and hydrated during hot summer days...", date: "2023-06-10" },
    { id: 2, title: "Importance of Regular Checkups", content: "Regular vet visits can help detect health issues early...", date: "2023-06-12" },
  ])

  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
  })

  const handleSendMessage = () => {
    setMessages([...messages, { ...newMessage, id: messages.length + 1, date: new Date().toISOString().split('T')[0] }])
    setNewMessage({ to: '', subject: '', content: '' })
  }

  const handleAddArticle = () => {
    setArticles([...articles, { ...newArticle, id: articles.length + 1, date: new Date().toISOString().split('T')[0] }])
    setNewArticle({ title: '', content: '' })
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Communication</h1>
      <Tabs defaultValue="messages">
        <TabsList>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="education">Educational Content</TabsTrigger>
        </TabsList>
        <TabsContent value="messages">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Messages</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>New Message</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Send New Message</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="to" className="text-right">To</Label>
                      <Input
                        id="to"
                        value={newMessage.to}
                        onChange={(e) => setNewMessage({ ...newMessage, to: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="subject" className="text-right">Subject</Label>
                      <Input
                        id="subject"
                        value={newMessage.subject}
                        onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="content" className="text-right">Content</Label>
                      <Textarea
                        id="content"
                        value={newMessage.content}
                        onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSendMessage}>Send Message</Button>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>To</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>{message.to}</TableCell>
                      <TableCell>{message.subject}</TableCell>
                      <TableCell>{message.date}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="education">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Educational Content</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Add Article</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Article</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">Title</Label>
                      <Input
                        id="title"
                        value={newArticle.title}
                        onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="content" className="text-right">Content</Label>
                      <Textarea
                        id="content"
                        value={newArticle.content}
                        onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddArticle}>Add Article</Button>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>{article.title}</TableCell>
                      <TableCell>{article.date}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

