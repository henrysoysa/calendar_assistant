"use client"

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { prisma } from '@/lib/prisma'
import { Task } from '@/types'
import { toast } from '@/components/ui/use-toast'  // Assuming you're using a toast component
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, parseISO, getHours, setHours, setMinutes, isToday, addMinutes } from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Moon, Sun, Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface Task {
  id: number
  taskName: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  project: string
  deadline: string
  timeRequired: string
}

const projectColors: { [key: string]: string } = {
  'Project A': 'bg-blue-500',
  'Project B': 'bg-green-500',
  'Project C': 'bg-yellow-500',
  'Project D': 'bg-purple-500',
}

interface CalendarOverviewTasksProps {
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
}

const CalendarOverviewTasks: React.FC<CalendarOverviewTasksProps> = ({ onSelectDate, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState("month")
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<string[]>(['Project A', 'Project B', 'Project C', 'Project D'])
  const [newTask, setNewTask] = useState<Task>({
    id: 0,
    taskName: '',
    description: '',
    priority: 'MEDIUM',
    project: '',
    deadline: '',
    timeRequired: '',
  })
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [openProjectSelect, setOpenProjectSelect] = useState(false)

  useEffect(() => {
    async function fetchTasks() {
      const fetchedTasks = await prisma.task.findMany()
      setTasks(fetchedTasks)
    }
    fetchTasks()
  }, [])

  const handleAddTask = async () => {
    if (newTask.taskName && newTask.deadline && newTask.timeRequired && newTask.project) {
      try {
        const createdTask = await prisma.task.create({
          data: {
            taskName: newTask.taskName,
            description: newTask.description,
            priority: newTask.priority,
            project: newTask.project,
            deadline: new Date(newTask.deadline),
            timeRequired: newTask.timeRequired,
          },
        })
        setTasks(prevTasks => [...prevTasks, createdTask])
        
        if (!projects.includes(newTask.project)) {
          setProjects(prevProjects => [...prevProjects, newTask.project])
        }
        
        setNewTask({
          id: 0,
          taskName: '',
          description: '',
          priority: 'MEDIUM',
          project: '',
          deadline: '',
          timeRequired: '',
        })
        setIsAddTaskOpen(false)
        setOpenProjectSelect(false)
        toast({
          title: "Success",
          description: "Task added successfully.",
        })
      } catch (error) {
        console.error('Error adding task:', error)
        toast({
          title: "Error",
          description: "Failed to add task. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
    }
  }

  const renderHeader = () => {
    let dateFormat = "MMMM yyyy"
    if (view === "day") {
      dateFormat = "MMMM d, yyyy"
    } else if (view === "week") {
      const start = startOfWeek(currentDate)
      const end = endOfWeek(currentDate)
      return (
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {format(start, "MMM d")} - {format(end, "MMM d, yyyy")}
          </h2>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )
    }
    return (
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">{format(currentDate, dateFormat)}</h2>
        <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const renderDays = () => {
    const dateFormat = "EEE"
    const days = []
    let startDate = startOfWeek(currentDate)
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-semibold">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      )
    }
    return <div className="grid grid-cols-7 gap-2 mb-2">{days}</div>
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)
    const dateFormat = "d"
    const rows = []

    let days = eachDayOfInterval({ start: startDate, end: endDate })

    let formattedDays = days.map((day) => {
      const dayTasks = tasks.filter(task => isSameDay(parseISO(task.deadline), day))
      return (
        <div
          key={day.toString()}
          className={`p-2 border cursor-pointer ${
            !isSameMonth(day, monthStart)
              ? "text-gray-400"
              : isToday(day)
              ? "bg-primary text-primary-foreground"
              : isSameDay(day, selectedDate)
              ? "bg-secondary text-secondary-foreground"
              : ""
          }`}
          onClick={() => setSelectedDate(day)}
        >
          <span className="text-sm">{format(day, dateFormat)}</span>
          {dayTasks.length > 0 && (
            <div className="flex flex-col mt-1 gap-1">
              {dayTasks.map((task, index) => (
                <div
                  key={index}
                  className={`text-xs p-1 rounded-sm ${projectColors[task.project] || 'bg-gray-500'} text-white truncate`}
                  title={task.taskName}
                >
                  {task.taskName}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    })

    for (let i = 0; i < formattedDays.length; i += 7) {
      rows.push(
        <div key={i} className="grid grid-cols-7 gap-2">
          {formattedDays.slice(i, i + 7)}
        </div>
      )
    }

    return <div className="mb-4">{rows}</div>
  }

  const renderWeekView = () => {
    const startOfWeekDate = startOfWeek(currentDate)
    const endOfWeekDate = endOfWeek(currentDate)
    const days = eachDayOfInterval({ start: startOfWeekDate, end: endOfWeekDate })

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayTasks = tasks.filter(task => isSameDay(parseISO(task.deadline), day))
          return (
            <div
              key={day.toString()}
              className={`p-2 border ${
                isToday(day) ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => setSelectedDate(day)}
            >
              <div className="font-semibold">{format(day, "EEE")}</div>
              <div>{format(day, "d")}</div>
              {dayTasks.map((task, index) => (
                <div
                  key={index}
                  className={`text-xs p-1 mt-1 rounded-sm ${projectColors[task.project] || 'bg-gray-500'} text-white truncate`}
                >
                  {task.taskName}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    )
  }

  const renderDayView = () => {
    const dayTasks = tasks.filter(task => isSameDay(parseISO(task.deadline), selectedDate))
    return (
      <div>
        <h3 className="text-xl font-semibold mb-4">{format(selectedDate, "MMMM d, yyyy")}</h3>
        {dayTasks.length > 0 ? (
          <ul className="space-y-2">
            {dayTasks.map((task) => (
              <li key={task.id} className="p-2 border rounded">
                <div className="font-semibold">{task.taskName}</div>
                <div className="text-sm text-gray-600">
                  Project: {task.project} | Priority: {task.priority} | Time: {task.timeRequired}
                </div>
                <div className="text-sm mt-1">{task.description}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No tasks scheduled for this day.</p>
        )}
      </div>
    )
  }

  const renderTaskTable = () => {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Time Required</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.taskName}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{task.priority}</TableCell>
                  <TableCell>{task.project}</TableCell>
                  <TableCell>{task.deadline}</TableCell>
                  <TableCell>{task.timeRequired}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button className="mt-4" onClick={() => setIsAddTaskOpen(true)}>
            Add Task
          </Button>
        </CardContent>
      </Card>
    )
  }

  const renderAddTaskDialog = () => {
    return (
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="taskName" className="text-right">
                Name
              </Label>
              <Input
                id="taskName"
                value={newTask.taskName}
                onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select
                value={newTask.priority}
                onValueChange={(value) => setNewTask({ ...newTask, priority: value as 'LOW' | 'MEDIUM' | 'HIGH' })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4  items-center gap-4">
              <Label htmlFor="project" className="text-right">
                Project
              </Label>
              <Popover open={openProjectSelect} onOpenChange={setOpenProjectSelect}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openProjectSelect}
                    className="col-span-3 justify-between"
                  >
                    {newTask.project || "Select project..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search project..." className="h-9" />
                    <CommandEmpty>No project found.</CommandEmpty>
                    <CommandGroup>
                      {projects.map((project) => (
                        <CommandItem
                          key={project}
                          onSelect={() => {
                            setNewTask({ ...newTask, project });
                            setOpenProjectSelect(false);
                          }}
                        >
                          {project}
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              newTask.project === project ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deadline" className="text-right">
                Deadline
              </Label>
              <Input
                id="deadline"
                type="date"
                value={newTask.deadline}
                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="timeRequired" className="text-right">
                Time Required
              </Label>
              <Input
                id="timeRequired"
                value={newTask.timeRequired}
                onChange={(e) => setNewTask({ ...newTask, timeRequired: e.target.value })}
                className="col-span-3"
                placeholder="e.g., 2h"
              />
            </div>
          </div>
          <Button onClick={handleAddTask}>Add Task</Button>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className={`container mx-auto p-4 ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Calendar Overview</h1>
        <div className="flex items-center gap-4">
          <Select value={view} onValueChange={setView}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          {renderHeader()}
          {view === "month" && renderDays()}
          {view === "month" && renderCells()}
          {view === "week" && renderWeekView()}
          {view === "day" && renderDayView()}
        </div>
        <div>
          {renderTaskTable()}
        </div>
      </div>
      {renderAddTaskDialog()}
      {isAddTaskOpen && (
        <AddTaskForm 
          onAddTask={handleAddTask} 
          onClose={() => setIsAddTaskOpen(false)} 
        />
      )}
    </div>
  )
}

const AddTaskForm: React.FC<{ onAddTask: (task: Task) => void, onClose: () => void }> = ({ onAddTask, onClose }) => {
  // ... form state and handlers

  return (
    <form onSubmit={(e) => { e.preventDefault(); onAddTask(newTask); }}>
      {/* Add your form inputs here */}
      <button type="submit">Save Task</button>
      <button onClick={onClose}>Cancel</button>
    </form>
  )
}

export default CalendarOverviewTasks;