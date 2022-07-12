import React from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { v4 } from "uuid";
import Column from "./column";

const initialData = {
    tasks: {
        'task-1': { id: 'task-1', content: 'Take out the garbage' },
        'task-2': { id: 'task-2', content: 'Watch my favorite show' },
        'task-3': { id: 'task-3', content: 'Charge my phone' },
        'task-4': { id: 'task-4', content: 'Cook dinner' },
    },
    columns: {
        'column-1': {
            id: 'column-1',
            title: 'To do',
            taskIds: ['task-1', 'task-2', 'task-3', 'task-4'],
        },
        'column-2': {
            id: 'column-2',
            title: 'In progress',
            taskIds: [],
        },
        'column-3': {
            id: 'column-3',
            title: 'Done',
            taskIds: [],
        }
    },
    // Facilitate reordering of the columns
    columnOrder: ['column-1', 'column-2', 'column-3'],
    group: {}
};

export interface IColumn {
    id: string;
    taskIds: string[];
    title: string;
}
export interface ITask {
    id: string;
    content: string;
}

class Index extends React.Component<{}, {
    tasks: {
        [key: string]: ITask;
    };
    columns: {
        [key: string]: IColumn;
    },
    columnOrder: string[],
    group: {
        [key: string]: ITask[];
    };
}> {
    constructor(props: {}) {
        super(props);
        this.state = initialData;
    }

    onDragEnd = (result: DropResult) => {
        document.body.style.color = 'inherit';
        document.body.style.backgroundColor = 'inherit';

        let { destination, source, draggableId } = result;
        console.log(result);

        //合并
        if (result.combine) {
            this.onCombine(result);
            return;
        }

        let state = { ...this.state };
        if (!destination) return;

        if (destination?.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        if (source.droppableId.split("-").length === 5) {
            this.onDragOutFromGroup(result);
            return;
        }

        if (destination?.droppableId.split("-").length === 5) {
            this.onDragIntoGroup(result);
            return;
        }

        const start = this.state.columns[source.droppableId];
        const finish = this.state.columns[destination.droppableId];

        if (start === finish) {

            let newTaskIds = Array.from(start.taskIds);

            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);

            state = {
                ...this.state,
                ...state,
                columns: {
                    ...this.state.columns,
                    [finish.id]: {
                        ...finish,
                        taskIds: newTaskIds,
                    },
                },
            };

            this.setState(state);
            return;
        }



        // Moving from one list to another
        const startTaskIds = Array.from(start.taskIds);
        startTaskIds.splice(source.index, 1);


        let finishTaskIds = Array.from(finish.taskIds);
        finishTaskIds.splice(destination.index, 0, draggableId);


        state = {
            ...this.state,
            ...state,
            columns: {
                ...this.state.columns,
                [start.id]: {
                    ...start,
                    taskIds: startTaskIds,
                },
                [finish.id]: {
                    ...finish,
                    taskIds: finishTaskIds,
                },
            },
        };
        this.setState(state);
    };

    //合并
    onCombine = (result: DropResult) => {
        let { source, combine } = result;
        if (!combine) return;

        const d1 = this.state.tasks[result.draggableId];
        const d2 = this.state.tasks[combine.draggableId];
        const column2 = this.state.columns["column-2"];

        const group = {
            ...this.state.group,

        };
        group[v4()] = [d1, d2]; //创建分组

        const start = this.state.columns[source.droppableId];
        const finish = this.state.columns[combine.droppableId];

        //同组内合并
        if (start === finish) {

            let newTaskIds = Array.from(start.taskIds).filter(d => d !== result.draggableId && d !== combine?.draggableId);

            const state = {
                ...this.state,
                group,
                columns: {
                    ...this.state.columns,
                    [finish.id]: {
                        ...finish,
                        taskIds: newTaskIds,
                    },
                },
            };

            this.setState(state);
            return;
        }
        let finishTaskIds2: string[] = [];
        let startTaskIds: string[] = [];
        // Moving from one list to another
        if (source.droppableId.split("-").length === 5) { //如果是从一个分组里面向其他元素合并
            group[source.droppableId] = group[source.droppableId].filter(d => d.id !== result.draggableId);
            if (group[source.droppableId].length === 1) { //hack一下
                finishTaskIds2 = column2.taskIds;
                finishTaskIds2.splice(0, 0, group[source.droppableId][0].id);

                delete group[source.droppableId];
            }
        }
        else {
            startTaskIds = Array.from(start.taskIds);
            startTaskIds.splice(source.index, 1);
        }
        const finishTaskIds = Array.from(finish.taskIds).filter(d => d !== result.draggableId && d !== result.combine?.draggableId);

        const columns = {
            ...this.state.columns,
        };
        if (start) {
            columns[start.id] = {
                ...start,
                taskIds: startTaskIds,
            };
        }

        columns[finish.id] = {
            ...finish,
            taskIds: finishTaskIds,
        };

        const state = {
            ...this.state,
            group,
            columns: columns,
            [column2.id]: {
                ...column2,
                taskIds: finishTaskIds2,
            }
        };
        this.setState(state);
    };

    //从分组中移除
    onDragOutFromGroup = (result: DropResult) => {

        const { destination, source, draggableId } = result;

        if (!destination) return;

        let state = { ...this.state };

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        //const start = this.state.columns[source.droppableId];
        const finish = this.state.columns[destination.droppableId];
        const column2 = this.state.columns["column-2"];




        const group = {
            ...this.state.group,
        };

        group[source.droppableId] = Array.from(group[source.droppableId]).filter(d => d.id !== draggableId);

        let finishTaskIds: string[] = []; //普通目标列的任务id, 
        let finishTaskIds2: string[] = [];

        if (destination.droppableId.split("-").length === 5) { //如果移入的对象也是一个分组
            const destinationGroup = group[destination.droppableId];
            destinationGroup.splice(destination.index, 0, this.state.tasks[draggableId]);
        }
        else if (finish) { //普通列
            finishTaskIds = Array.from(finish.taskIds);
            finishTaskIds.splice(destination.index, 0, draggableId);
        }

        if (group[source.droppableId].length === 1) {
            if (destination.droppableId === "column-1" || destination.droppableId.split("-").length === 5) { //这里hack一下, 判断如果只剩一个任务, 就放到column-2
                finishTaskIds2 = column2.taskIds;
                finishTaskIds2.splice(destination.index, 0, group[source.droppableId][0].id);
            }
            else
                finishTaskIds.splice(destination.index, 0, group[source.droppableId][0].id);
            delete group[source.droppableId];
        }

        state.group = group;

        const columns = {
            ...this.state.columns,

        };

        if (finish) { //普通列
            columns[finish.id] = {
                ...finish,
                taskIds: finishTaskIds,
            };
        }

        state = {
            ...this.state,
            ...state,
            columns,
            [column2.id]: {
                ...column2,
                taskIds: finishTaskIds2,
            }
        };
        this.setState(state);
    };

    //移入分组,如果移入时合并, 则执行onCombine, 不走本方法
    onDragIntoGroup = (result: DropResult) => {
        let { destination, source, draggableId } = result;
        if (!destination) return;

        let state = { ...this.state };

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const start = this.state.columns[source.droppableId];


        let group = state.group[destination.droppableId];
        group.splice(destination.index, 0, this.state.tasks[draggableId]);

        // Moving from one list to another
        const startTaskIds = Array.from(start.taskIds);
        startTaskIds.splice(source.index, 1);

        state = {
            ...this.state,
            ...state,
            columns: {
                ...this.state.columns,
                [start.id]: {
                    ...start,
                    taskIds: startTaskIds,
                },
            },
        };
        this.setState(state);
    };

    render() {
        return (
            <DragDropContext
                onDragEnd={this.onDragEnd}
            >
                {/* {this.state.columnOrder.map((columnId) => {
                    const column = this.state.columns[columnId];
                    const tasks = column.taskIds.map(taskId => this.state.tasks[taskId]);

                    return <Column key={column.id} column={column} tasks={tasks} group={this.state.group} />;
                })} */}

                <Column key={"column-1"} column={this.state.columns["column-1"]} tasks={this.state.columns["column-1"].taskIds.map(taskId => this.state.tasks[taskId])} group={{}} />
                <Column key={"column-2"} column={this.state.columns["column-2"]} tasks={this.state.columns["column-2"].taskIds.map(taskId => this.state.tasks[taskId])} group={this.state.group} />

            </DragDropContext>
        );
    }
}

export default Index;